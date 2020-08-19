'use strict';

define('forum/flags/list', ['components', 'Chart'], function (components, Chart) {
	var Flags = {};

	Flags.init = function () {
		Flags.enableFilterForm();

		components.get('flags/list').on('click', '[data-flag-id]', function () {
			var flagId = this.getAttribute('data-flag-id');
			ajaxify.go('flags/' + flagId);
		});

		var graphWrapper = $('#flags-daily-wrapper');
		var graphFooter = graphWrapper.siblings('.panel-footer');
		$('#flags-daily-wrapper').one('shown.bs.collapse', function () {
			Flags.handleGraphs();
		});
		graphFooter.on('click', graphWrapper.collapse.bind(graphWrapper, 'toggle'));
	};

	Flags.enableFilterForm = function () {
		var filtersEl = components.get('flags/filters');

		// Parse ajaxify data to set form values to reflect current filters
		for (var filter in ajaxify.data.filters) {
			if (ajaxify.data.filters.hasOwnProperty(filter)) {
				filtersEl.find('[name="' + filter + '"]').val(ajaxify.data.filters[filter]);
			}
		}
		filtersEl.find('[name="sort"]').val(ajaxify.data.sort);

		document.getElementById('apply-filters').addEventListener('click', function () {
			var payload = filtersEl.serializeArray().filter(function (item) {
				return !!item.value;
			});
			ajaxify.go('flags?' + (payload.length ? $.param(payload) : 'reset=1'));
		});
	};

	Flags.handleGraphs = function () {
		var dailyCanvas = document.getElementById('flags:daily');
		var dailyLabels = utils.getDaysArray().map(function (text, idx) {
			return idx % 3 ? '' : text;
		});

		if (utils.isMobile()) {
			Chart.defaults.global.tooltips.enabled = false;
		}
		var data = {
			'flags:daily': {
				labels: dailyLabels,
				datasets: [
					{
						label: '',
						backgroundColor: 'rgba(151,187,205,0.2)',
						borderColor: 'rgba(151,187,205,1)',
						pointBackgroundColor: 'rgba(151,187,205,1)',
						pointHoverBackgroundColor: '#fff',
						pointBorderColor: '#fff',
						pointHoverBorderColor: 'rgba(151,187,205,1)',
						data: ajaxify.data.analytics,
					},
				],
			},
		};

		dailyCanvas.width = $(dailyCanvas).parent().width();
		new Chart(dailyCanvas.getContext('2d'), {
			type: 'line',
			data: data['flags:daily'],
			options: {
				responsive: true,
				animation: false,
				legend: {
					display: false,
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							precision: 0,
						},
					}],
				},
			},
		});
	};

	return Flags;
});
