## Overview

This project contains:
- Scripts for extraction of ECMA-262 Abstract Syntax Trees (ASTs), decoration, and normalization for import into the ECMA-262 MPS IDE
- Docker image to run the scripts in an environment-independent way

This project builds on ESMeta, an existing ECMAScript metalanguage parser.

## System requirements

Docker and Docker Compose must be installed locally.

## Build

```bash
cd container && docker compose build
```

## Run

This section describes how to extract and normalize the ASTs from a given version of ECMA-262.

First of all, specify the ECMA-262 version that you want to extract:

```bash
cd container && echo "ECMA262_VERSION=<tag or commit hash of ECMA-262>" > .env
```

Now it is possible to create and run a new container that runs the extraction process:

```bash
docker compose up
```

The ASTs of the specification document will be available at the path `container/<tag or commit hash of ECMA-262>`.