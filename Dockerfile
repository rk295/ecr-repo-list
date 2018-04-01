FROM python:2.7-slim-jessie

LABEL version="1.0"
LABEL description="A web interface to the list of repositories in an Amazon ECR registry without the need for AWS keys."
LABEL maintainer="robin@kearney.co.uk"

RUN mkdir /app
RUN useradd -M -d /app -s /bin/sh gunicorn

COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt

COPY static /app/static
COPY main.py /app/
COPY run /app/

WORKDIR /app
USER gunicorn
EXPOSE 8080/tcp

CMD ["/app/run"]
