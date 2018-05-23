'use strict'

/**
 * Supervise your node modules
 *
 * @module superdep
 * @exports superdep
 */

const fs = require('fs')
	, fse = require('fs-extra')
	, path = require('path')
	, readline = require('linebyline')
	, spawn = require('cross-spawn')
	, nodePackager = 'npm'


/**
 * This function ensures that a target directory exists.
 *
 * @param {string} dirPath - a folder to create
 * @throws {error} if there is a problem with the dirPath
 */
const mkdirpAsync = function (dirPath) {
	// https://gist.github.com/christophemarois/e30650691cf74b9da2e51e13a01c7f70
	const mkdirAsync = currentPath => new Promise((resolve, reject) => {
		fs.mkdir(currentPath, err => err ? reject(err) : resolve())
	}).catch(err => {
		if (err.code === 'EEXIST') return Promise.resolve()
		throw err
	})

	let parts = dirPath.split(path.sep)

	// Support absolute urls
	if (parts[0] === '') {
		parts.shift()
		parts[0] = path.sep + parts[0]
	}

	let chain = Promise.resolve()

	parts.forEach((part, i) => {
		const currentPath = parts.slice(0, i + 1).join(path.sep)
		chain = chain.then(() => mkdirAsync(currentPath))
	})
	return chain
}

/**
 * Optional sync version for checking if the target folder exists
 * Alias if we need it NOW!!!
 *
 * @param {string} target - a folder to target
 */
const checkTgt = function(target) {
	mkdirpAsync(target)
	.catch((err) => {console.error(err)})
	.then(()  => {return true})
}

const getPackager = function(dropkick, nodePackager) {
	// thanks Razvan (quasar-cli)
	return nodePackager === 'npm'
		? ['install']
		: ['add', '--exact']
}

module.exports = {}
let superdep
superdep = exports.superdep = {
	/**
	 * Cycle through all of the project's node modules and update the submodules.
	 *
	 */
	global: function (packager) {
		console.log('Sorry, global not yet implemented.')
		return chain
	},
	/**
	 * target a configuration
	 *
	 * @param {string} config
	 * @returns {array} [repo,sub,version]
	 */
	targeted: function (config, packager) {
		checkTgt(target)
		let dropkick
		const supervise = (dropkick) => new Promise((resolve, reject) => {
			this.surgical(dropkick)
		})
		.then(() => Promise.resolve())
		.catch(err => {
			console.log(err)
			Promise.resolve()
		})

		let chain = Promise.resolve()
		let rl = readline(config)
		rl.on('line', function(line, lineCount) {
			dropkick = line
			chain = chain.then(() => supervise(dropkick))
		})
		.on('error', function(e) {
			console.log(e)
		})
		return chain
	},
	/**
	 * target one specific sub-dependency
	 *
	 * @param {string} target
	 * @returns {boolean} success / failure
	 */
	surgical: function (target, packager) {
		// stylus/source-map:0.6.1
		if (!packager) {packager = 'npm'}
		let dropkick
		let cmdParam = getPackager(packager)


		const supervise = (dropkick) => new Promise((resolve, reject) => {
			console.log('----------------------------------------------------')
			console.log("| Dropkick => ", dropkick[0], dropkick[1], dropkick[2], dropkick[3])
			console.log('----------------------------------------------------')

			const dropTarget = `.superdep_jail/${dropkick[3]}/${dropkick[1]}`
			mkdirpAsync(dropTarget)
			.then(() => {

				let dropDir = path.resolve(process.cwd(), dropTarget);
				console.log(dropDir)
				console.log(packager)

				spawn.sync(
					packager,
					cmdParam.concat(`${dropkick[1]}@${dropkick[2]}`),
					{ stdio: 'inherit' },
					() => console.log('Failed to install dependencies')
				)
					fse.copySync(process.cwd() + `/node_modules/${dropkick[1]}`, dropDir)
					fse.copySync(dropDir, process.cwd() + `/node_modules/${dropkick[0]}/node_modules/${dropkick[1]}`)
					// removeSync is too dangerous
					// fse.removeSync(process.cwd() + `/node_modules/${dropkick[1]}`)
			})
			return true
		})
		.catch(err => {
			console.log(err)
			Promise.resolve()
		})

		let chain = Promise.resolve()
		dropkick = target.split('/')
		dropkick[3] = target
		if (dropkick.length <= 3 || dropkick.length >= 5) {
			console.error('Target malformed.')
			console.error('Please use format: "stylus/source-map/0.6.1"')
			process.exit(0)
		}
		chain = chain.then(() => supervise(dropkick))
		return chain
	}
}

if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		let exports
		exports = module.exports = superdep
	}
	exports.superdep = superdep
}
