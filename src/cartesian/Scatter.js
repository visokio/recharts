/**
 * @fileOverview Render a group of scatters
 */
import React, { Component, PropTypes } from 'react';
import Animate from 'react-smooth';
import classNames from 'classnames';
import _ from 'lodash';
import pureRender from '../util/PureRender';
import Layer from '../container/Layer';
import { PRESENTATION_ATTRIBUTES, EVENT_ATTRIBUTES, getPresentationAttributes,
  filterEventsOfChild, isSsr } from '../util/ReactUtils';
import Curve from '../shape/Curve';
import Symbols from '../shape/Symbols';
import AnimationDecorator from '../util/AnimationDecorator';

@AnimationDecorator
@pureRender
class Scatter extends Component {

  static displayName = 'Scatter';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    ...PRESENTATION_ATTRIBUTES,

    xAxisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    yAxisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    zAxisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    line: PropTypes.oneOfType([
      PropTypes.bool, PropTypes.object, PropTypes.func, PropTypes.element,
    ]),
    lineType: PropTypes.oneOf(['fitting', 'joint']),
    lineJointType: PropTypes.oneOfType([PropTypes.oneOf([
      'basis', 'basisClosed', 'basisOpen', 'linear', 'linearClosed', 'natural',
      'monotoneX', 'monotoneY', 'monotone', 'step', 'stepBefore', 'stepAfter',
    ]), PropTypes.func]),
    legendType: PropTypes.oneOf([
      'line', 'square', 'rect', 'circle', 'cross', 'diamond', 'square', 'star',
      'triangle', 'wye',
    ]),
    className: PropTypes.string,

    activeIndex: PropTypes.number,
    activeShape: PropTypes.oneOfType([
      PropTypes.object, PropTypes.func, PropTypes.element,
    ]),
    shape: PropTypes.oneOfType([
      PropTypes.oneOf(['circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye']),
      PropTypes.element,
      PropTypes.func,
    ]),
    points: PropTypes.arrayOf(PropTypes.shape({
      cx: PropTypes.number,
      cy: PropTypes.number,
      size: PropTypes.number,
      node: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      }),
      payload: PropTypes.object,
    })),

    isAnimationActive: PropTypes.bool,
    animationId: PropTypes.number,
    animationBegin: PropTypes.number,
    animationDuration: PropTypes.number,
    animationEasing: PropTypes.oneOf(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
  };

  static defaultProps = {
    xAxisId: 0,
    yAxisId: 0,
    zAxisId: 0,
    legendType: 'circle',
    lineType: 'joint',
    lineJointType: 'linear',
    data: [],
    shape: 'circle',

    isAnimationActive: !isSsr(),
    animationBegin: 0,
    animationDuration: 400,
    animationEasing: 'linear',
  };

  state = { activeIndex: -1 };

  renderSymbolItem(option, props) {
    let symbol;

    if (React.isValidElement(option)) {
      symbol = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      symbol = option(props);
    } else {
      symbol = <Symbols {...props} type={option} />;
    }

    return symbol;
  }


  renderSymbols() {
    const { points, shape, activeShape, activeIndex, animationBegin,
      animationDuration, isAnimationActive, animationEasing, animationId } = this.props;
    const baseProps = getPresentationAttributes(this.props);

    return points.map((entry, i) => {
      const props = {
        key: `symbol-${i}`,
        ...baseProps,
        ...entry,
      };
      return (
        <Layer
          className="recharts-scatter-symbol"
          {...filterEventsOfChild(this.props, entry, i)}
          key={`symbol-${i}`}
        >
          <Animate
            from={{ size: 0 }}
            to={{ size: props.size }}
            duration={animationDuration}
            begin={animationBegin}
            isActive={isAnimationActive}
            key={animationId}
            easing={animationEasing}
          >
            {
              ({ size }) => {
                const finalProps = { ...props, size };

                return this.renderSymbolItem(activeIndex === i ? activeShape : shape, finalProps);
              }
            }
          </Animate>
        </Layer>
      );
    });
  }

  renderLine() {
    const { points, line, lineType, lineJointType } = this.props;
    const scatterProps = getPresentationAttributes(this.props);
    const customLineProps = getPresentationAttributes(line);
    let linePoints, lineItem;

    if (lineType === 'joint') {
      linePoints = points.map(entry => ({ x: entry.cx, y: entry.cy }));
    }
    const lineProps = {
      ...scatterProps,
      fill: 'none',
      stroke: scatterProps && scatterProps.fill,
      ...customLineProps,
      points: linePoints,
    };

    if (React.isValidElement(line)) {
      lineItem = React.cloneElement(line, lineProps);
    } else if (_.isFunction(line)) {
      lineItem = line(lineProps);
    } else {
      lineItem = <Curve {...lineProps} type={lineJointType} />;
    }

    return (
      <Layer className="recharts-scatter-line" key="recharts-scatter-line">
        {lineItem}
      </Layer>
    );
  }

  render() {
    const { points, line, className } = this.props;

    if (!points || !points.length) { return null; }

    const layerClass = classNames('recharts-scatter', className);

    return (
      <Layer className={layerClass}>
        {line && this.renderLine()}
        <Layer key="recharts-scatter-symbols">
          {this.renderSymbols()}
        </Layer>
      </Layer>
    );
  }
}

export default Scatter;
