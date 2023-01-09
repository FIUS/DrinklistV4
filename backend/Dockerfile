FROM python:3-bullseye

WORKDIR /usr/src/app

RUN apt update
RUN apt -y install texlive texlive-luatex texlive-lang-german texlive-latex-extra pandoc

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "-u", "./main.py" ]