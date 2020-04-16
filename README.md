# Rowma
[![Coverage Status](https://coveralls.io/repos/github/rowma/rowma/badge.svg?branch=master)](https://coveralls.io/github/rowma/rowma?branch=master)
[![Build Status](https://travis-ci.com/rowma/rowma.svg?branch=master)](https://travis-ci.com/rowma/rowma)

<p align="center">
  <img width="660" src="/logo.png">
</p>

This repository is ConnectionManager's repository.

Further information about Rowma, please check our [documentation](https://rowma.github.io/documentation/en/getting-started).

## Getting Started
You can start your own ConnectionManager on your environment.

## Prerequisites
You need to install Node.js and npm on your computer.

* Node.js
* npm

## Install
Clone this repository and install dependencies.

```
$ git clone https://github.com/rowma/rowma
$ cd rowma
$ npm i
```

## Start server
Then run the server (pleases make sure you have a right to open port 80).

```
$ npm run build && npm start
```

Finally, you successfully started your own ConnectionManager if you get any response from `curl localhost/list_connections`.

### Docker Support
Also docker environment is supported.

```
$ docker build -t rowma .
$ docker run -p 3000:3000 rowma -d
```

That's it!

## Contribution
Feel free to open any issue anytime! Please have a look at the contribution guidelines first.

## License
The GPL License (GPL) 2020 - rowma.io. Please have a look at the LICENSE.md for more details.
