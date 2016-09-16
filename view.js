gunNumber = 0;

$(function(){
    $('#addgun').click(function(){
        grid = $('.gun-grid').val();
        elevation = $('.gun-elevation').val();
        $('.gunlist').prepend('' +
            '<tr class="gunrow" id="gun' + gunNumber + '">' +
            '<td class="number">' + gunNumber + '</td>' +
            '<td class="grid">' + grid + '</td>' +
            '<td class="elevation">' + elevation + '</td>' +
            '<td><a class="btn btn-warning removegun"><i class="fa fa-close"></i></a></td>' +
            '</tr>'
            );
        gunNumber++;
        $(".removegun").click(function(){removegun(this);});
        updateBaseSelect();
    });

    function removegun(element) {
        $(element).closest('tr').remove();
    }

    function updateBaseSelect() {
        dropdown = $("#basegun");
        dropdown.empty();
        $(".gunlist .gunrow").each(function(){
            name = $(this).find(".number").text();
            dropdown.append($("<option />").val(name).text(name));
        });
    }
});