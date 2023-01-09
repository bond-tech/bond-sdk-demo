import sdk from 'https://cdn.skypack.dev/bond-sdk-web';

const css = {
  fontFamily: "Sans-Serif",
  fontSize: "1.15em",
  color: "rgb(96,107,243)",
};

function successCallback(data) {
  console.log(`show success: ${JSON.stringify(data)}`);
}

function errorCallback(error) {
  console.log(error);
}

function showCard(cards, customerId, cardId) {
  console.log(`show card ${cardId} details for customer ${customerId}`);
  fetch(`/token/${customerId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      cards
        .show({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          field: "number",
          htmlSelector: "#num",
          css: css,
          format: {
            replaceThis: "(\\d{4})(\\d{4})(\\d{4})(\\d{4})",
            withThis: "$1-$2-$3-$4",
          },
        })
        .then((iframe) => {
          cards
            .copy({
              iframe,
              htmlSelector: "#copy-card-number",
              text: '<svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 36 36" width="36"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
              callback: (status) => {
                if (status === "success") {
                  console.log("copied!");
                } else {
                  console.log("error!");
                }
              },
              format: {
                replaceThis: "\\W",
                withThis: "",
              },
              css: {
                cursor: "pointer",
              },
            })
            .then(successCallback)
            .catch(errorCallback);
        })
        .catch(errorCallback);

      cards
        .show({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          field: "expiry",
          htmlSelector: "#exp",
          css: css,
          format: {
            replaceThis: "(\\d{2})(\\d{4})",
            withThis: "$1/$2",
          },
        })
        .then(successCallback)
        .catch(errorCallback);

      cards
        .show({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          field: "cvv",
          htmlSelector: "#cvv",
          css: css,
        })
        .then(successCallback)
        .catch(errorCallback);
    });
}

function viewCardPIN(cards, customerId, cardId) {
  console.log(`view card ${cardId} PIN for customer ${customerId}`);
  fetch(`/token/${customerId}`)
    .then((response) => response.json())
    .then((data) => {
      cards
        .showPIN({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          htmlSelector: "#current-pin",
          css: css,
        })
        .then(successCallback)
        .catch(errorCallback);
    });
}

function setCardPIN(cards, customerId, cardId) {
  console.log(`set card ${cardId} PIN for customer ${customerId}`);
  fetch(`/token/${customerId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(document.getElementById("new-pin").value);
      console.log(document.getElementById("current-pin").value);

      cards.submit({
        cardId: `${cardId}`,
        identity: data.Identity,
        authorization: data.Authorization,
        currentPin: document.getElementById("current-pin").value,
        newPin: document.getElementById("new-pin").value,
        successCallback: function (status, data) {
          console.log(status, data);
          /* document.getElementById(
            "result"
          ).innerHTML = `current_pin @ service: ${data.current_pin}<br/>
            new_pin @ service: ${data.new_pin}<br/>`;
            */
        },
        errorCallback: errorCallback,
      });
    });
}

function resetCardPIN(cards, customerId, cardId) {
  console.log(`reset card ${cardId} PIN for customer ${customerId}`);
  fetch(`/token/${customerId}`)
    .then((response) => response.json())
    .then((data) => {
      cards
        .showPIN({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          reset: true,
          htmlSelector: "#current-pin",
          css: css,
        })
        .then(successCallback)
        .catch(errorCallback);
    });
}

function showSetPinFields(cards, customerId, cardId) {
  cards
    .field({
      selector: "#new-pin",
      type: "new_pin",
      successColor: "#4F8A10",
      errorColor: "#D8000C",
      placeholder: "5678",
    })
    .catch(errorCallback);

  cards
    .field({
      selector: "#compare-pin",
      type: "confirm_pin",
      successColor: "#4F8A10",
      errorColor: "#D8000C",
      placeholder: "5678",
    })
    .catch(errorCallback);

  document.querySelector("#set-pin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    setCardPIN(cards, customerId, cardId);
  });
}

function connectExternalAccount(customerId) {
  fetch(`/token/${customerId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const bondExternalAccounts = new sdk.BondExternalAccounts({live: false})

      bondExternalAccounts
        .linkAccount({
          customerId: customerId,
          identity: data.Identity,
          authorization: data.Authorization
        })
        .then(successCallback)
        .catch(errorCallback);
    })
    .catch(errorCallback);
}

/* setup */

document.addEventListener("DOMContentLoaded", function (e) {
  let query = {};
  window.location.search
    .substring(1)
    .split("&")
    .forEach((kvp) => {
      var pair = kvp.split("=");
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    });

  let cardId = query.card;
  let customerId = query.customer
    ? query.customer
    : "00000000-0000-0000-0000-000000000000";

  document.getElementById("customer-id").innerHTML = `${customerId}`;
  document.getElementById("card-id").innerHTML = `${cardId}`;

  fetch(`/live`)
    .then((response) => response.json())
    .then((data) => {
      let live = data.live ? true : false; // assert bool from truthy?
      var cards = new BondCards({ live: live });

      showCard(cards, customerId, cardId);

      showSetPinFields(cards, customerId, cardId);

      document.getElementById("view-pin").addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          viewCardPIN(cards, customerId, cardId);
        },
        false
      );
      document.getElementById("reset-pin").addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          resetCardPIN(cards, customerId, cardId);
        },
        false
      );
      document.getElementById("connect-external-account-button").addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          connectExternalAccount(customerId);
        },
        false
      );
  });
});
