# Wings · [![Build Status](https://img.shields.io/travis/hph/wings/master.svg)](https://travis-ci.org/hph/wings) [![Coverage](https://img.shields.io/coveralls/hph/wings/master.svg)](https://coveralls.io/github/hph/wings)

A text editor inspired by Vim, written in JavaScript and React.

Caveat emptor: this application is built for my own needs and is almost
certainly of no direct use to anyone else.

![Demo](https://www.dropbox.com/s/qog2a5d8rdcjs6q/Wings.png?raw=1)

## Download

The latest Mac release is available for download [here](https://github.com/hph/wings/releases).
You can also [build the app](https://github.com/hph/wings#building-for-production)
yourself, which should work on Mac, Linux and Windows.

## Usage

Wings is heavily inspired by [Vim](https://en.wikipedia.org/wiki/Vim_(text_editor))
and currently supports a subset of its commands, in addition to some new
things. At this time there is no proper documentation or even a list of
features, but you can check out the keys section of the
[default config](https://github.com/hph/wings/blob/master/src/main-process/default-config.yaml)
to learn more.

## Development

In order to run Wings in development mode you will need
[Git](https://git-scm.com/download),
[Node.js](https://nodejs.org/en/download/) and ideally
[Yarn](https://yarnpkg.com/en/docs/install). Once you have all of those
installed, you may fetch the project and install its dependencies as follows:

    git clone git@github.com:hph/wings.git
    cd wings
    yarn install

In order to build the app and automatically rebuild it when the code is
changed, open a new terminal in the same directory and run:

    yarn build:dev

You should now be able to go back to the previous terminal and start Wings:

    yarn start

You may optionally provide an argument to open a file, such as `package.json`:

    yarn start package.json

## Testing & code quality

The project is set up with a small but growing set of tests and a linter, both
of which you can run:

    yarn lint
    yarn test

You can see the results for the linter and tests for the master branch on
[Travis CI](https://travis-ci.org/hph/wings) and code coverage information on
[Coveralls](https://coveralls.io/github/hph/wings).

## Building for production

The build process is a bit slower in production mode as it minifies the code
and also builds the app into a single package. Run the following command:

    NODE_ENV=production yarn build

The production build has only been tested on a Mac. If you run into any issues,
please let me know by [opening an issue](https://github.com/hph/wings/issues/new).
