FROM sbtscala/scala-sbt:eclipse-temurin-24.0.1_9_1.11.7_3.3.6

ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=23.10.0
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default \
    && npm install -g npm@10.9.2
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# ESMeta with sections extraction
WORKDIR /
RUN git clone --branch extract-sections https://github.com/tontonialberto/esmeta-extract-json.git esmeta
ENV ESMETA_HOME=/esmeta
ENV PATH="$ESMETA_HOME/bin:$PATH"
WORKDIR /esmeta
RUN git submodule update --init && sbt assembly

# AST normalization scripts
WORKDIR /
RUN git clone https://github.com/tontonialberto/ecma262-projectional-editor-scripts.git
WORKDIR /ecma262-projectional-editor-scripts/spec-manipulator
RUN npm install

WORKDIR /
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
