# ConnectionManager
[![Coverage Status](https://coveralls.io/repos/github/asmsuechan/rowma_connection_manager/badge.svg?branch=master)](https://coveralls.io/github/asmsuechan/rowma_connection_manager?branch=master)
[![Build Status](https://travis-ci.com/asmsuechan/rowma_connection_manager.svg?branch=master)](https://travis-ci.com/asmsuechan/rowma_connection_manager)

<p align="center">
  <img width="460" src="/logo.png">
</p>

ConnectionManager is a WebSocket server for rowma.

I host a ConnectionManager at `http://18.176.1.219`, it is used by default.

## rowma repository
Check [the rowma main repository](https://github.com/asmsuechan/rowma) for more information to utilize rowma.

## Run on your environment
First you need to clone this repository to your local environment:

```
$ git@github.com:asmsuechan/rowma_connection_manager.git
```

If you need your own environment, check the commands bellow:

```
$ npm i
$ npm run build
$ sudo npm run start
```

The default port of ConnectionManager is 80, so you will probably need root privilege when the server starts.

## Use Docker
Also docker is supported.

```
$ docker build -t rowma .
$ docker run -p 80:80 rowma -d
```

## Contribution
Feel free to open issues anytime!

## TODO
* Log related things
* More error handlings
* Testing
