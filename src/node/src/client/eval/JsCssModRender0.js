


var mod_js = '';
var mod_css = '<style>';
var JsCssController = modJsCssController(req, res, i, mod_js, mod_css, back_);
mod_css = JsCssController.css;
mod_js = JsCssController.js;
mod_css = mod_css + '</style>';
