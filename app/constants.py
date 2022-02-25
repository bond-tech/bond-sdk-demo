from os import environ
from os.path import exists
from dotenv import load_dotenv

# load .env file if it exists (not under systemd or kubernetes)
if exists(".env"):
    load_dotenv()

identity = environ["IDENTITY"]
authorization = environ["AUTHORIZATION"]
live = environ.get("LIVE", "false").lower().startswith("t")

bond_host = "https://api.bond.tech" if live else "https://sandbox.bond.tech"
