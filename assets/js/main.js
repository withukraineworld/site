/**
* Template Name: Maundy - v4.6.0
* Template URL: https://bootstrapmade.com/maundy-free-coming-soon-bootstrap-theme/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Countdown timer
   */
  // let countdown = select('.countdown');
  // const output = countdown.innerHTML;

  // const countDownDate = function() {
  //   let timeleft = new Date(countdown.getAttribute('data-count')).getTime() - new Date().getTime();

  //   let days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
  //   let hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //   let minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
  //   let seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

  //   countdown.innerHTML = output.replace('%d', days).replace('%h', hours).replace('%m', minutes).replace('%s', seconds);
  // }
  // countDownDate();
  // setInterval(countDownDate, 1000);



  let multiselect;
  let globalConfig;
  let countryMessageIndex = 0;
  let countryMessages = [];


  multiselect = $('#multiselect').magicSuggest({
    allowDuplicates: false,
    allowFreeEntries: false,
    expandOnFocus: true,
    maxSelection: 5,
  });
  $(multiselect).on('selectionchange', function () {
    updateTweet();
  });

  $('#changeMessage').on('click', function () {
    countryMessageIndex += 1;
    if (countryMessageIndex > countryMessages.length-1) {
      countryMessageIndex = 0;
    }
    $('#message').val(countryMessages[countryMessageIndex]);
    updateTweet();
  })


  function onChangeCountry() {
    var countryData = $("#country").countrySelect("getSelectedCountryData");
    const country = countryData.iso2;
    $.getJSON(`assets/data/politicians/${country}.json`, function (politiciansJson) {
      multiselect.clear();
      politiciansJson.forEach((el, i) => {
        el.id = `${el.name}${i}`;
      })
      console.log(politiciansJson);
      multiselect.setData(politiciansJson);
    });
    countryMessages = globalConfig && globalConfig.messages && globalConfig.messages[country];
    countryMessageIndex = 0;
    if (!countryMessages) {
      const defaultMessages = globalConfig && globalConfig.messages && globalConfig.messages['default'];
      countryMessages = defaultMessages;
    }
    $('#message').val(countryMessages[countryMessageIndex]);
    $('#changeMessage').hide();
    if (countryMessages.length > 1) {
      $('#changeMessage').show();
    }
    updateTweet();
  }

  $.getJSON('assets/data/config.json', function (config) {


    globalConfig = config;
    $("#country").countrySelect({
      // onlyCountries: ['us', 'ca', 'tr', 'at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'es', 'se', 'gb'],
      onlyCountries: config.countries
      // responsiveDropdown: true
    });
    $('#country').change(onChangeCountry);
    onChangeCountry();
    $.getJSON('https://europe-central2-withukraine-342906.cloudfunctions.net/geolocation2', function (ipdata) {
      const visitorCountry = ipdata.country.toLowerCase();
      if (config.countries.indexOf(visitorCountry) !== -1) {
        $("#country").countrySelect("selectCountry", visitorCountry);
        onChangeCountry();
      }
    });
  });

  function updateTweet() {
    const TWITTER_MAX_CHARS = 280;
    const hashtags = '#WorldWithUkraine';
    const url = 'https://withukraine.world';
    const message = $('#message').val().trim();
    const pols = multiselect.getSelection();
    const mentions = pols.map(x => x.twitter).join(' ');
    function makeTweet(msg) {
      return `${mentions} ${msg} ${hashtags} ${url}`;
    }
    const remainingChars = TWITTER_MAX_CHARS - makeTweet('').length;
    if (!message || !mentions.trim() || message.length > remainingChars) {
      $('#sendLinkContainer').addClass('sendLinkContainerDisabled');
      $('#sendLink').attr('target', null);
      $('#sendLink').attr('href', 'javascript:void(0)');
      return;
    }
    const tweet = makeTweet(message);
    const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    $('#sendLinkContainer').removeClass('sendLinkContainerDisabled');
    $('#sendLink').attr('target', "_blank");
    $('#sendLink').attr('href', href);
  }

  $('#message').bind('input propertychange', updateTweet);




})()