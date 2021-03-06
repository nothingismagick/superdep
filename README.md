# superdep [WIP]
Supervise the dependencies in a node project because its your project.

## why
Modern `npm` will inform you about the dependencies your project integrates, specifically when they are outdated or have security implications. The problem is that many of the projects that you might be using have not updated their dependencies, and even if you file an issue and make a PR, there is no guarantee that anything will happen. 

**superdep** offers a solution to this situation, which is opinionated and probably something that most people will not find useful. There are three approaches: GLOBAL, TARGETED and SURGICAL.

Its **`GLOBAL`** method scans all of the dependencies within your project - and when it finds a package that is out of date it will add that project to its own dependencies and hard copy that dependency folder to the offending package's node_modules. This will probably break your package, but it is fun to watch, because it will probably take A VERY LONG TIME! 

Its **`LOCAL`** method will accept a configuration file that will only seek and replace specific packages within specific dependencies. This is the recommended approach.

Its **`SURGICAL`** method will treat one specific issue in one repository.

## how

# BACKUP YOUR PROJECT! 


Install:
```bash
$ yarn global add superdep

or

$ npm install --global superdep
```

Run:
```bash
$ superdep                                         # without config it is GLOBAL
$ superdep --local=.superdep                       # pass a file to parse for surgical lines
$ superdep --surgical='stylus/source-map/0.6.1'    # pass a surgical line
```

#### .superdep
```yml
# THIS WILL WORK
stylus/source-map/0.6.1

# THIS WONT WORK YET BUT WOULD BE NICE
imagemin-optipng/optipng-bin
    optipng-bin/bin-build
        bin-build/download
            download/caw
                caw/tunnel-agent/0.6.0
```

## gotchas
After you run any npm or yarn install / update command, chances are good that your changes will be overwritten. This is why it is probably good to use a custom command to update your repository - or rewrite the [npm install command](https://stackoverflow.com/questions/48983841/run-postinstall-hook-for-any-local-dependency/48987576#48987576).
