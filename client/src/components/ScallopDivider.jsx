const ScallopDivider = ({ flip = false, style = {} }) => (
  <div className={`scallop-divider${flip ? ' flip' : ''}`} style={style} aria-hidden="true" />
);

export default ScallopDivider;
