FROM node:12.13.0
#TEST
ENV VERSION=dev
RUN apt-get update && \
    apt-get install -y --no-install-recommends gettext-base && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN npm i -g serve
RUN git clone -b dev https://github.com/ibi-group/datatools-ui.git /opt/datatools-ui
WORKDIR /opt/datatools-ui
# Add config directory
ADD ./configurations/default/*.yml /config/
RUN yarn
COPY ./configurations/default/settings.yml /opt/datatools-ui/configurations/default/settings.yml
EXPOSE 9966
CMD envsubst < /config/env.yml > /opt/datatools-ui/configurations/default/env.yml && \
    $(npm bin)/mastarm build --env production && serve -p 9966