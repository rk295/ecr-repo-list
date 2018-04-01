FROM python:2.7-slim-jessie

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
