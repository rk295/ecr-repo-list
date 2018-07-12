FROM golang:1.9-alpine3.7

LABEL version="1.0"
LABEL description="A web interface to the list of repositories in an Amazon ECR registry without the need for AWS keys."
LABEL maintainer="robin@kearney.co.uk"

RUN mkdir /app
RUN adduser -h /app -s /bin/sh -D repo-list

COPY static /app/static
COPY main /app/
COPY run /app/

RUN chown -Rv repo-list: /app

WORKDIR /app
USER repo-list
EXPOSE 8080/tcp

ENV GIN_MODE=release

CMD ["./main"]
