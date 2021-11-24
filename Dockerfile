
FROM python:3.9-slim

SHELL ["/bin/bash", "-c"]

# Python settings
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONCASEOK=1

# make sure all the requirements are here
COPY pyproject.toml poetry.lock ./

# Make sure base image's system is fully updated and has the following: 
# 
#   build-essential: compilation necessities
#   python-dev: for building python applications
#   libpq-dev: for building postgres applications. Not needed after Psycopg2 built?
# 
RUN apt-get update 1> /dev/null \
    && apt-get install -y --no-install-recommends \
        build-essential python-dev libpq-dev curl netcat vim procps \
        1> /dev/null \
    && curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py \
        | python - \
    && source $HOME/.poetry/env \
    && poetry config virtualenvs.create false 1> /dev/null \
    && poetry install --no-dev --no-interaction --no-ansi \
    && apt-get remove -y build-essential python-dev 1> /dev/null \
    && apt-get autoremove -y 1> /dev/null \
    && rm -rf /var/lib/apt/lists/*

# Application directory setup
WORKDIR /app
COPY . .

# Expose Port
EXPOSE 8000

# use start script to setup DB correctly and start the server
CMD [ "bash" , "start" ]
