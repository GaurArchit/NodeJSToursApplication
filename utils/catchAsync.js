module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
// Just an understaning way
// module.exports = function(fn) {
//   return function(req, res, next) {
//     fn(req, res, next).catch(next);
//   };
// };
