# Bond Card Management Demo

This demo uses the Bond cards SDK ([repo](https://github.com/bond-tech/bond-sdk-cards), [cdn](https://cdn.bond.tech/sdk/cards/v1/bond-sdk-cards.js)) to illustrate how to handle card presentment and PIN setting. 

It can be used as a starting point to build an application that shows card information, or to view card information for test cards that you create in the early stages of building a program with Bond. 

## Overview

<img width="638" alt="image" src="https://user-images.githubusercontent.com/62680784/142752838-4a8207e6-804f-405f-8d16-fb4a97ba952d.png">

This is a minimal demo service showing how to run the Bond Card SDK with a backend. Particularly, the demo shows how you might include a method in your backend to pass back valid temporary keys (or "few time tokens") to allow your cardholders to securely access their card details, without exposing your own Bond credentials on the web. More details on how to implement this can be found in the [API guide](https://docs.bond.tech/docs/retrieve-card-details-set-pins-and-reset-pins)

This application is built on [FastAPI](https://fastapi.tiangolo.com/), is run under [`unvicorn`](https://www.uvicorn.org/) or [`gunicorn`](https://gunicorn.org/) with a [`unvicorn` worker](https://www.uvicorn.org/#running-with-gunicorn), and uses [`poetry`](https://python-poetry.org/) for package management. 

## Getting started

To run this demo, you'll need Bond API keys, an ID for a Bond [customer](https://docs.bond.tech/reference/post_customers), and an ID for a Bond [card](https://docs.bond.tech/reference/post_cards). If you do not have these, sign up for Bond's [Sandbox](https://signup.bond.tech) and view the [API guides](https://docs.bond.tech) and [Postman collection](https://docs.bond.tech/docs/postman-collection) to get started. 

### Docker

If you have [Docker](https://www.docker.com/products/docker-desktop) installed, the quickest way to run this demo is to run 
```
docker build . -t sdk-demo:local
docker run -e IDENTITY=<your identity> -e AUTHORIZATION=<your secret> -e LIVE=true -p 8000:8000 sdk-demo:local
```

Then open a browser to 
```
http://localhost:8000/static/view.html?card=<your_card_id>&customer=<your_customer_id>
```
where `card_id` is a valid Bond card ID and `customer_id` is a valid Bond customer ID. 

### Local run 
To run locally, clone the repo and run
```
poetry install && poetry update
poetry run uvicorn app:app --port=8000 --reload
```
(Leave off `--reload` to prevent code changes from sparking server reloads.)  Open a browser to 
```
http://localhost:8000/card/view?card=<your_card_id>&customer=<your_customer_id>
```
where `card_id` is a valid Bond card ID and `customer_id` is a valid Bond customer ID. 

