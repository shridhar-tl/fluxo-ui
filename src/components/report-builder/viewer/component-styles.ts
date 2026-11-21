import type React from 'react';
import type { ComponentStyleProps } from '../report-definition-types';

export function toReactCSSProps(styles: ComponentStyleProps): React.CSSProperties {
    const css: React.CSSProperties = {};
    if (styles.textColor) css.color = styles.textColor;
    if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor;
    if (styles.fontSize) css.fontSize = styles.fontSize;
    if (styles.fontFamily) css.fontFamily = styles.fontFamily;
    if (styles.fontWeight) css.fontWeight = styles.fontWeight;
    if (styles.fontStyle) css.fontStyle = styles.fontStyle;
    if (styles.textAlign) css.textAlign = styles.textAlign;
    if (styles.borderColor) css.borderColor = styles.borderColor;
    if (styles.borderWidth) css.borderWidth = styles.borderWidth;
    if (styles.borderStyle) css.borderStyle = styles.borderStyle;
    if (styles.borderRadius) css.borderRadius = styles.borderRadius;
    if (styles.paddingTop != null) css.paddingTop = styles.paddingTop;
    if (styles.paddingRight != null) css.paddingRight = styles.paddingRight;
    if (styles.paddingBottom != null) css.paddingBottom = styles.paddingBottom;
    if (styles.paddingLeft != null) css.paddingLeft = styles.paddingLeft;
    if (styles.marginTop != null) css.marginTop = styles.marginTop;
    if (styles.marginRight != null) css.marginRight = styles.marginRight;
    if (styles.marginBottom != null) css.marginBottom = styles.marginBottom;
    if (styles.marginLeft != null) css.marginLeft = styles.marginLeft;
    if (styles.width) css.width = styles.width;
    if (styles.height) css.height = styles.height;
    return css;
}
