FROM debian:12
SHELL ["/bin/bash", "--login", "-c"]

WORKDIR /app
RUN touch /app/README.md

# Install base dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
  apt-transport-https \
  build-essential \
  ca-certificates \
  curl \
  git \
  libssl-dev \
  wget \
  nginx \
  && rm -rf /var/lib/apt/lists/*

# Install nodejs using nvm v0.39.4
# There is no "latest" tag for nvm as far as I know
# Using nvm though allows us to upgrade node to the latest supported version
# by angular, just by specifying the node_version build arg
ARG node_version=20
RUN mkdir -p /usr/local/nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
RUN nvm install $node_version
RUN nvm use $node_version
ENV PATH /app/node_modules/.bin:$PATH
RUN ln -s $(which node) /usr/bin/node
RUN ln -s $(which npm) /usr/bin/npm

# Copy the contents of the src directory into the container
# Start with the package.json and package-lock.json files to install the node dependencies
# using npm. The code is copied after to take advantage of docker caching
COPY package*.json /app/
RUN npm install
COPY . /app
RUN npm run ng build --configuration=production

# Remove default nginx static dir
RUN rm -rf /usr/share/nginx/html
# Symlink from build output dir to nginx static dir
RUN ln -s /app/dist/connector_demo /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
