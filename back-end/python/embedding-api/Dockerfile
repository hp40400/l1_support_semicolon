FROM python:3.9

WORKDIR /code

ENV OPENAI_API_KEY=OPENAI_API_KEY_HERE

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./main.py /code/

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80"]
