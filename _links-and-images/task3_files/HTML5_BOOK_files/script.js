jQuery( function () {
	var scrollbtn = jQuery( '.scroll-top' );
	scrollbtn.click( function () {
		jQuery( "html, body" ).animate( { scrollTop: 0 }, 300 );
		return false;
    });
    var $search_btn = jQuery('.search-box > i'),
    $search_form = jQuery('form.search-form');
    $search_btn.on('click', function () {
        $search_form.toggleClass('open');
    });
    jQuery(document).on('click', function (e) {
        if (jQuery(e.target).closest($search_btn).length === 0
            && jQuery(e.target).closest('input.search-field').length === 0
            && $search_form.hasClass('open')) {
            $search_form.removeClass('open');
        }
    });
});

/**
 * Возвращает единицу измерения с правильным окончанием
 * 
 * @param {Number} num      Число
 * @param {Object} cases    Варианты слова {nom: 'час', gen: 'часа', plu: 'часов'}
 * @return {String}            
 */
function units(num, cases) {
    num = Math.abs(num);    
    var word = '';    
    if (num.toString().indexOf('.') > -1) {
        word = cases.gen;
    } else { 
        word = (
            num % 10 == 1 && num % 100 != 11 
                ? cases.nom
                : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) 
                    ? cases.gen
                    : cases.plu
        );
    }    
    return word;
}