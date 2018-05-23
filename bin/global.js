#!/usr/bin/env node
'use strict'

const info = require('../package.json')
const args = require('minimist')(process.argv.slice(2), {
	alias: {
		l: 'local',
		s: 'surgical',
		p: 'packager',
		v: 'version',
		h: 'help'
	},
	default: {
		dir: process.cwd()
	}
})

if (args.version) {
	console.log('superdep: v.' + info.version)
	console.log('     Author: D.C. Thompson')
	console.log('     License: MIT')
	process.exit(0)
}

if (args.help) {
	console.log('Superdep: v.' + info.version)
	console.log('     Author: D.C. Thompson')
	console.log('     License: MIT')
	console.log(`
Supervise the dependencies in a node project and will get new
versions of that projects dependencies and install those. 
    
Flags:    
  -l, --local       configure targeted with a file
  -s, --surgical    target one specific sub-dependency
  -p, --packager    on of [npm|yarn]
  -v, --version     display version information
  -h, --help        display this information
  
Usage:
    
$ npm run superdep                                         # without config it is GLOBAL
$ npm run superdep --local=.superdep                       # pass a targets file composed of lines like surgical
$ npm run superdep --surgical="stylus/source-map/0.6.1"    # one line of a local struct 
    `)
	process.exit(0)
}


const superdep = require('../lib/index.js')
if(args.local) {
	console.log('superdep: v.' + info.version)
	console.log('Going LOCAL!')
	superdep.targeted(args.local, args.packager)
} else if(args.surgical) {
	console.log('superdep: v.' + info.version)
	console.log('Going SURGICAL!')
	superdep.surgical(args.surgical, args.packager)
} else {
	console.log('superdep: v.' + info.version)
	console.log('Going GLOBAL!')
	superdep.global(args.packager)
}
