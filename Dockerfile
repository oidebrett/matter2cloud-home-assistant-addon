ARG COMMITHASH=0d7e59ca5b96c8db23d13b34b38dc669b9f87830

ARG BUILD_FROM
FROM $BUILD_FROM as base

ENV LANG C.UTF-8

# Dependencies and build
FROM base as dependencies_and_build

#RUN apk add --no-cache --virtual .buildtools npm make gcc g++ linux-headers udev git python3 corepack && \
#    echo "Installing Matter2Cloud" && \
#    git clone -b dev --single-branch --depth 1 \
#    https://github.com/cannikin/cambium-rsc /app && \
#    mkdir /app/dist && \
#    jq -n --arg commit $(eval cd /app;git rev-parse --short HEAD) '$commit' > /app/dist/.hash ; \
#    echo "Installed Matter2Cloud @ version $(cat /app/dist/.hash)" && \
#    cd /app && \
#    corepack enable && \
#    yarn install && \
#    yarn build
#

WORKDIR /webui

RUN apk add --update --no-cache npm dumb-init git && \
    echo "Installing Matter2Cloud"

RUN npm uninstall -g yarn pnpm && \
    npm install -g corepack && \
    echo "Installing corepack"

RUN git clone https://github.com/oidebrett/matter2cloud.git /webui && \
    mkdir /webui/dist && \
    jq -n --arg commit $(eval cd /webui;git rev-parse --short HEAD) '$commit' > /webui/dist/.hash ; \
    echo "Installed Matter2Cloud @ version $(cat /webui/dist/.hash)" && \
    cd /webui && \
    corepack enable && \
    yarn install

RUN cd /webui && \
    yarn rw build

# Copy data for add-on
COPY start.sh /webui/start.sh
RUN chmod a+x /webui/start.sh
ENTRYPOINT ["/webui/start.sh"]

LABEL io.hass.version="VERSION" io.hass.type="addon" io.hass.arch="armhf|aarch64|i386|amd64"