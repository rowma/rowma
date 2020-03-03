<p align="center">
  <img width="660" src="/logo.png">
</p>

---

# Rowma
[![Coverage Status](https://coveralls.io/repos/github/asmsuechan/rowma_connection_manager/badge.svg?branch=master)](https://coveralls.io/github/asmsuechan/rowma_connection_manager?branch=master)
[![Build Status](https://travis-ci.com/asmsuechan/rowma_connection_manager.svg?branch=master)](https://travis-ci.com/asmsuechan/rowma_connection_manager)

This repository is ConnectionManager's repository.

Further information about Rowma, please check our [documentation](https://rowma.github.io/documentation/en/getting-started).

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
Feel free to open any issue anytime! Please have a look at the contribution guidelines first.

## License
The GPL License (GPL) 2020 - rowma.io. Please have a look at the LICENSE.md for more details.
