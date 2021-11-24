
const css = { 
  fontFamily: 'Sans-Serif',
  fontSize: '1.15em',
  color: "rgb(96,107,243)" ,
};

function successCallback(data) {
  console.log(`show success: ${JSON.stringify(data)}`);
}

function errorCallback(error) {
  console.log(error);
}

function showCard(cards, customerId, cardId) {

  console.log(`show card ${cardId} details for customer ${customerId}`);
  fetch( `/token/${customerId}` )
    .then( response => response.json() )
    .then( data => {

      console.log(data);

      cards.show({
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
        .then(successCallback)
        .catch(errorCallback);

      cards.show({
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

      cards.show({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          field: "cvv",
          htmlSelector: "#cvv",
          css: css,
        })
        .then(successCallback)
        .catch(errorCallback);

  } );

}

function viewCardPIN(cards, customerId, cardId) {

  console.log(`view card ${cardId} PIN for customer ${customerId}`);
  fetch( `/token/${customerId}` )
    .then( response => response.json() )
    .then( data => {

      cards.showPIN({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          htmlSelector: "#current-pin",
          css: css,
        })
        .then(successCallback)
        .catch(errorCallback);

  } );

}

function setCardPIN(cards, customerId, cardId) {

  console.log(`set card ${cardId} PIN for customer ${customerId}`);
  fetch( `/token/${customerId}` )
    .then( response => response.json() )
    .then( data => {

      console.log( document.getElementById("new-pin").value )
      console.log( document.getElementById("current-pin").value )

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
  fetch( `/token/${customerId}` )
    .then( response => response.json() )
    .then( data => {

      cards.showPIN({
          cardId: `${cardId}`,
          identity: data.Identity,
          authorization: data.Authorization,
          reset: true,
          htmlSelector: "#current-pin",
          css: css,
        })
        .then(successCallback)
        .catch(errorCallback);

  } );

}

function showSetPinFields(cards, customerId, cardId) {

  cards.field({
      selector: "#new-pin",
      type: "new_pin",
      successColor: "#4F8A10",
      errorColor: "#D8000C",
      placeholder: "5678",
    }).catch(errorCallback);

    cards.field({
      selector: "#compare-pin",
      type: "confirm_pin",
      successColor: "#4F8A10",
      errorColor: "#D8000C",
      placeholder: "5678",
    }).catch(errorCallback);

  document.querySelector("#set-pin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    setCardPIN(cards, customerId, cardId);
  });

}

/* setup */

document.addEventListener("DOMContentLoaded", function(e) {

  let query = {};
  window.location.search.substring(1).split('&').forEach( kvp => {
    var pair = kvp.split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  });

  let cardId = query.card;
  let customerId = query.customer ? query.customer : "00000000-0000-0000-0000-000000000000";

  document.getElementById('customer-id').innerHTML = `${customerId}`;
  document.getElementById('card-id').innerHTML = `${cardId}`;

  fetch( `/live` )
    .then( response => response.json() )
    .then( data => {

      let live = data.live ? true : false; // assert bool from truthy?
      var cards = new BondCards({ live: live });

      showCard(cards, customerId, cardId);

      showSetPinFields(cards, customerId, cardId);

      document.getElementById('view-pin').addEventListener("click", (e) => {
        e.preventDefault();
        viewCardPIN(cards, customerId, cardId);
      }, false);

      document.getElementById('reset-pin').addEventListener("click", (e) => {
        e.preventDefault();
        resetCardPIN(cards, customerId, cardId);
      }, false);

    });

});


