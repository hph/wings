# Wings · [![Build Status](https://img.shields.io/travis/hph/wings/master.svg?style=flat-square)](https://travis-ci.org/hph/wings) [![Coverage](https://img.shields.io/coveralls/hph/wings/master.svg?style=flat-square)](https://coveralls.io/github/hph/wings)

A text editor inspired by Vim, written in JavaScript and React.

Caveat emptor: this application is built for my own needs and is almost
certainly of no direct use to anyone else.

![Demo](https://www.dropbox.com/s/qog2a5d8rdcjs6q/Wings.png?raw=1)

## Download

The latest Mac release is available for download
[here](https://github.com/hph/wings/releases). Note that releases are built
infrequently and that You can also [build the
app](https://github.com/hph/wings#building-for-production) yourself.

## Usage

Wings is heavily inspired by
[Vim](<https://en.wikipedia.org/wiki/Vim_(text_editor)>) and currently supports
a subset of its commands, in addition to some new features. At this time there
is no proper documentation or even a list of features, but you can explore the
keys section of the [default
config](https://github.com/hph/wings/blob/master/src/main-process/default-config.yaml)
to learn more.

## Development

In order to run Wings in development mode you will need
[Git](https://git-scm.com/download), [Node.js](https://nodejs.org/en/download/)
and ideally [Yarn](https://yarnpkg.com/en/docs/install). Once you have all of
those installed, you may fetch the project and install its dependencies as
follows:

    git clone git@github.com:hph/wings.git
    cd wings
    yarn

In order to build the app and automatically rebuild it when the code is changed,
open a new terminal in the same directory and run:

    yarn build:dev

You should now be able to go back to the previous terminal and start Wings:

    yarn start

You may optionally provide an argument to open a file, such as `package.json`:

    yarn start package.json

### Development tools

You may run the linter (ESLint with a custom config) as follows:

    yarn lint

The project includes a code formatter (Prettier), which can be run as follows:

    yarn format

The project is also set up with a comprehensive test suite, which you may also
run:

    yarn test

You can see the results for the linter, formatter and tests for the master
branch on [Travis CI](https://travis-ci.org/hph/wings) and code coverage
information on [Coveralls](https://coveralls.io/github/hph/wings). Builds are
run against all branches and pull requests.

## Building for production

The build process is a bit slower in production mode as it minifies the code and
also builds the app into a single package. Run the following command:

    NODE_ENV=production yarn build

The production build has only been tested on a Mac. If you run into any issues,
please [open an issue](https://github.com/hph/wings/issues/new).
