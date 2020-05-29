import 'dart:html';
import 'dart:js';

import 'package:amdjs/amdjs.dart';
import 'package:swiss_knife/swiss_knife.dart';

import 'chart_engine_base.dart';
import 'chart_engine_colors.dart';
import 'chart_engine_date.dart';
import 'chart_engine_series.dart';


/// ChartJS (v2.9.3) Engine.
///
/// Automatically loads `chart.js` using `AMDJS`.
class ChartEngineChartJS extends ChartEngine {
  static final String VERSION = '2.9.3';

  static final String PATH = CHART_ENGINE_PACKAGE_PATH + '/chartjs-$VERSION';

  static final String JS_PATH = '$PATH/Chart.js';

  static final String JS_PATH_MIN = '$PATH/Chart.min.js';

  static final String ENGINE_WRAPPER_PATH = '$PATH/chart_engine_wrapper.js';

  static final String JS_WRAPPER_GLOBAL_NAME =
      '__ChartEngine_Wrapper_ChartJS__';

  static bool _minified = true;

  static bool get minified => _minified;

  /// If true uses minified version of JS files. Should be set before call [load] method.
  static set minified(bool value) {
    _minified = value ?? false;
  }

  static final LoadController _loadController =
      LoadController('ChartEngineChartJS');

  @override
  bool get isLoaded =>
      _loadController.isLoaded && _loadController.loadSuccessful;

  @override
  EventStream<LoadController> get onLoad => _loadController.onLoad;

  static JsObject _jsWrapper;

  /// Loads ChartJS (`chart.js`) and engine wrapper.
  @override
  Future<bool> load() {
    return _loadController.load(() async {
      var jsFullPath = minified ? JS_PATH_MIN : JS_PATH;
      var okJS = await AMDJS.require('chartjs', jsFullPath, globalJSVariableName: 'Chart');
      var okWrapper = await AMDJS.require(
          JS_WRAPPER_GLOBAL_NAME, ENGINE_WRAPPER_PATH,
          globalJSVariableName: JS_WRAPPER_GLOBAL_NAME);

      _jsWrapper = context[JS_WRAPPER_GLOBAL_NAME] as JsObject;

      _allowInterop() ;

      return okJS && okWrapper;
    });
  }

  static void _allowInterop() {
    if (_jsWrapper == null) {
      throw StateError("Can't allowInterop _DateAdapter: null _jsWrapper") ;
    }
    _jsWrapper['_DateAdapter__parse'] = allowInterop( DateAdapter.parse );
    _jsWrapper['_DateAdapter__format'] = allowInterop( DateAdapter.format );
    _jsWrapper['_DateAdapter__startOf'] = allowInterop( DateAdapter.startOf );
    _jsWrapper['_DateAdapter__endOf'] = allowInterop( DateAdapter.endOf );
    _jsWrapper['_DateAdapter__add'] = allowInterop( DateAdapter.add );
    _jsWrapper['_DateAdapter__diff'] = allowInterop( DateAdapter.diff );
    _jsWrapper['_DateAdapter__create'] = allowInterop( DateAdapter.create );

  }

  /// Ensures that DOM element to render is a canvas. If not will insert a canvas
  /// inside the element and use it.
  CanvasElement asCanvasElement(Element element) {
    if (element == null) {
      throw ArgumentError('Expected a DOM element, but was null!');
    }

    if (element is CanvasElement) return element;

    var canvas = CanvasElement(width: 640, height: 480);
    element.children.add(canvas);

    return canvas;
  }

  @override
  bool renderLineChart(Element output, ChartSeries chartSeries) {
    checkRenderParameters(output, chartSeries);
    checkLoaded();

    var canvas = asCanvasElement(output);

    var series = chartSeries.options.sortCategories
        ? chartSeries.seriesSorted
        : chartSeries.series;

    chartSeries.ensureColors(STANDARD_COLOR_GENERATOR);

    var colors = chartSeries.colors;

    var renderArgs = [
      canvas,
      chartSeries.title,
      chartSeries.xTitle,
      chartSeries.yTitle,
      JsObject.jsify(chartSeries.xLabels),
      JsObject.jsify(series),
      JsObject.jsify(colors),
      chartSeries.options.fillLines,
      chartSeries.options.straightLines
    ];

    _jsWrapper.callMethod('renderLine', renderArgs);

    return true;
  }

  @override
  bool renderTimeSeriesChart(Element output, ChartTimeSeries chartSeries) {
    checkRenderParameters(output, chartSeries);
    checkLoaded();

    var canvas = asCanvasElement(output);

    var series = chartSeries.options.sortCategories
        ? chartSeries.seriesSorted
        : chartSeries.series;

    var timeSeries = chartSeries.seriesWithPairMap(series) ;

    print('renderTimeSeriesChart:') ;
    print(timeSeries) ;

    chartSeries.ensureColors(STANDARD_COLOR_GENERATOR);

    var colors = chartSeries.colors;

    var renderArgs = [
      canvas,
      chartSeries.title,
      chartSeries.xTitle,
      chartSeries.yTitle,
      JsObject.jsify(timeSeries),
      JsObject.jsify(colors),
      chartSeries.options.fillLines,
      chartSeries.options.straightLines
    ];

    _jsWrapper.callMethod('renderTimeSeries', renderArgs);

    return true;
  }

  @override
  bool renderBarChart(Element output, ChartSeries chartSeries) {
    return _renderBarChartImpl(false, output, chartSeries) ;
  }

  @override
  bool renderHorizontalBarChart(Element output, ChartSeries chartSeries) {
    return _renderBarChartImpl(true, output, chartSeries) ;
  }

  bool _renderBarChartImpl(bool horizontal, Element output, ChartSeries chartSeries) {
    checkRenderParameters(output, chartSeries);
    checkLoaded();

    var canvas = asCanvasElement(output);

    var series = chartSeries.options.sortCategories
        ? chartSeries.seriesSorted
        : chartSeries.series ;

    chartSeries.ensureColors(STANDARD_COLOR_GENERATOR);

    var colors = chartSeries.colors;

    var renderArgs = [
      horizontal,
      canvas,
      chartSeries.title,
      chartSeries.xTitle,
      chartSeries.yTitle,
      JsObject.jsify(chartSeries.xLabels),
      JsObject.jsify(series),
      JsObject.jsify(colors),
    ];

    _jsWrapper.callMethod('renderBar', renderArgs);

    return true;
  }

  @override
  bool renderGaugeChart(Element output, ChartSet chartSet) {
    checkRenderParameters(output, chartSet);
    checkLoaded();

    var canvas = asCanvasElement(output);

    var set = chartSet.options.sortCategories
        ? chartSet.setSorted
        : chartSet.set;

    chartSet.ensureColors(STANDARD_COLOR_GENERATOR);

    var colors = chartSet.colors;
    var disabledColors = chartSet.disabledColors;

    var renderArgs = [
      canvas,
      chartSet.title,
      chartSet.xTitle,
      chartSet.yTitle,
      JsObject.jsify(chartSet.xLabels),
      JsObject.jsify(set),
      JsObject.jsify(colors),
      JsObject.jsify(disabledColors),
    ];

    _jsWrapper.callMethod('renderGauge', renderArgs);

    return true;
  }
}
