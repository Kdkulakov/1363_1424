window.onload = function () {
    var _quantity, _price, orderitem_num, delta_quantity, orderitem_quantity, delta_cost;
    var quantity_arr = [];
    var price_arr = [];

    var total_forms = parseInt($('input[name=orderitems-TOTAL_FORMS]').val());

    var order_total_quantity = parseInt($('.order_total_quantity').text()) || 0;
    var order_total_price = parseFloat($('.order_total_cost').text().replace(',', '.')) || 0;

    for(var i=0; i < total_forms; i++) {
        _quantity = parseInt($('input[name=orderitems-' + i + '-quantity]').val());
        _price = parseFloat($('.orderitems-' + i + '-price').text().replace(',', '.'));

        quantity_arr[i] = _quantity;
        if(_price) {
            price_arr[i] = _price;
        } else {
            price_arr[i] = 0;
        }

        $('.order_form').on('click', 'input[type=number]', function () {
            var target = event.target;
            orderitem_num = parseInt(target.name.replace('orderitems-', '').replace('-quantity', ''));
            if(price_arr[orderitem_num]){
                orderitem_quantity = parseInt(target.value);
                delta_quantity = orderitem_quantity - quantity_arr[orderitem_num];
                quantity_arr[orderitem_num] = orderitem_quantity;
                orderSummaryUpdate(price_arr[orderitem_num], delta_quantity);
            }
        });

        $('.order_form').on('click', 'input[type=checkbox]', function () {
            var target = event.target;
            orderitem_num = parseInt(target.name.replace('orderitems-', '').replace('-quantity', ''));
            if(target.checked){
                delta_quantity = -quantity_arr[orderitem_num];
            } else {
                delta_quantity = quantity_arr[orderitem_num];
            }
            orderSummaryUpdate(price_arr[orderitem_num], delta_quantity);
        });

        function orderSummaryUpdate(orderitem_price, delta_quantity){
            delta_cost = orderitem_price * delta_quantity;
            order_total_price = Number((order_total_price + delta_cost).toFixed(2));

            order_total_quantity = order_total_quantity + delta_quantity;

            $('.order_total_quantity').html(order_total_quantity.toString());
            $('.order_total_cost').html(order_total_price.toString() + ',00');
        }
    }

    function deleteOrderItem(row) {
       var target_name= row[0].querySelector('input[type="number"]').name;
       orderitem_num = parseInt(target_name.replace('orderitems-', '').replace('-quantity', ''));
       delta_quantity = -quantity_arr[orderitem_num];
       quantity_arr[orderitem_num] = 0;
        if (!isNaN(price_arr[orderitem_num]) && !isNaN(delta_quantity)) {
            orderSummaryUpdate(price_arr[orderitem_num], delta_quantity);
        }
    }

    $('.formset_row').formset({
       addText: 'добавить продукт',
       deleteText: 'удалить',
       prefix: 'orderitems',
       removed: deleteOrderItem
    });
    $('.add-row').on('click', function () {
        quantity_arr.push(0);
        price_arr.push(0);
    })

    if(!order_total_quantity){
        orderSummaryRecalc();
    }

    function orderSummaryRecalc() {
        order_total_quantity = 0;
        order_total_price = 0;

        for (let i=0; i < total_forms; i++){
            order_total_quantity += quantity_arr[i];
            order_total_price += quantity_arr[i] * price_arr[i];
        }
        $('.order_total_quantity').html(order_total_quantity.toString());
        $('.order_total_cost').html(Number(order_total_price.toFixed(2).toString()));

    }

    $('.order_form').on('change', 'select', function (){
        let target = event.target;
        orderitem_num = parseInt(target.name.match(/\d+/)[0]);
        let orderitem_product_pk = target.options[target.selectedIndex].value;

        if (orderitem_product_pk){
            $.ajax({
                url: `/orders/product/${orderitem_product_pk}/price/`,
                success: function (data) {
                    if (data.price){
                        price_arr[orderitem_num] = parseFloat(data.price);
                        if(isNaN(quantity_arr[orderitem_num])){
                            quantity_arr[orderitem_num] = 0;
                        }
                        let price_html = '<span>' + data.price.toString().replace('.', ',') + '</span> руб';
                        let current_tr = $('.order_form table').find('tr:eq(' + (orderitem_num +1) + ')');
                        current_tr.find('td:eq(2)').html(price_html);

                        if(isNaN(current_tr.find('input[type="number"]').val())) {
                            current_tr.find('input[type="number"]').val(0);
                        }
                        orderSummaryRecalc();
                    }

                }
            });
        }
    });
};