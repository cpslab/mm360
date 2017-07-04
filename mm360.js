if (typeof kotlin === 'undefined') {
  throw new Error("Error loading module 'mm360'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'mm360'.");
}
var mm360 = function (_, Kotlin) {
  'use strict';
  var println = Kotlin.kotlin.io.println_s8jyv4$;
  function main(args) {
    var message = 'Hello JavaScript!';
    println(message);
  }
  _.main_kand9s$ = main;
  Kotlin.defineModule('mm360', _);
  main([]);
  return _;
}(typeof mm360 === 'undefined' ? {} : mm360, kotlin);
