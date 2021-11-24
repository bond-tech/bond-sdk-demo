
import requests

from uuid import UUID

from fastapi import FastAPI, Request, Response, Header, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional

from app.constants import (
    identity , authorization , live , bond_host
)

app = FastAPI()

@app.get("/health")
async def health():

    # verify bond's auth service is reachable
    url = f"{bond_host}/auth/health/alive"
    r = requests.get(url)
    if r.status_code != 200: 
        raise HTTPException(status_code=500, detail="Bond's auth service isn't reachable")

    # verify key permissions for making one time tokens
    url = f"{bond_host}/api/v0/auth/"
    head = {
        'Identity': identity , 
        'Authorization': authorization , 
        'X-BaaS-Service': 'auth',
        'X-BaaS-Route': '/key/temporary',
        'X-BaaS-Method': 'post',
    }
    r = requests.get(url, headers=head)
    if r.status_code != 200: 
        raise HTTPException(status_code=500, detail="You cannot create temporary keys")

    # the one-time tokens will have permissions for the actual card routes
    # so we don't need to check those

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/live")
async def is_live():
    return { 'live' : live }

@app.get("/token/{customer}")
async def get_customer_token(customer: UUID):
    url = f"{bond_host}/api/v0/auth/key/temporary"
    data = {"customer_id":str(customer)}
    head = {
        'Identity': identity , 
        'Authorization': authorization , 
        'Content-type': 'application/json' ,
    }
    r = requests.post(url, headers=head, json=data)
    if r.status_code in [200,201]: 
        return r.json()
    raise HTTPException(status_code=r.status_code, detail=f"failed to create token: {r.text}")

@app.get("/card/view/{card}")
async def get_html_card(card: UUID, customer: Optional[UUID] = None):
    url = f"/static/view.html?card={card}"
    if customer is not None: 
        url = f"{url}&customer={customer}"
    return RedirectResponse(url)

