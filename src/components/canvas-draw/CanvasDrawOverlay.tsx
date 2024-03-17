import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import type {
    DrawTool,
    DrawToolDefaults,
    DrawObject,
    DrawPoint,
    DrawItem,
    DrawGroup,
    DrawTransition,
    CanvasBackground,
} from './canvas-draw-types';
import { colorMap, autoFontColor } from './canvas-draw-types';

const svgNs = 'http://www.w3.org/2000/svg';

function uid(): string {
    return `cd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
    return document.createElementNS(svgNs, tag) as SVGElementTagNameMap[K];
}

function clr(c: string): string {
    return colorMap[c as keyof typeof colorMap] ?? c;
}

function fontStyleStr(obj: { fontBold?: boolean; fontItalic?: boolean; fontUnderline?: boolean }): string {
    let s = '';
    if (obj.fontBold) s += 'font-weight:700;';
    if (obj.fontItalic) s += 'font-style:italic;';
    if (obj.fontUnderline) s += 'text-decoration:underline;';
    return s;
}

function getVideoBounds(videoEl: HTMLVideoElement): { x: number; y: number; w: number; h: number } {
    const rect = videoEl.getBoundingClientRect();
    const vw = videoEl.videoWidth;
    const vh = videoEl.videoHeight;
    if (!vw || !vh) return { x: 0, y: 0, w: rect.width, h: rect.height };

    const containerAspect = rect.width / rect.height;
    const videoAspect = vw / vh;

    let renderedW: number;
    let renderedH: number;
    if (containerAspect > videoAspect) {
        renderedH = rect.height;
        renderedW = renderedH * videoAspect;
    } else {
        renderedW = rect.width;
        renderedH = renderedW / videoAspect;
    }

    const offsetX = (rect.width - renderedW) / 2;
    const offsetY = (rect.height - renderedH) / 2;
    return { x: offsetX, y: offsetY, w: renderedW, h: renderedH };
}

const handleSz = 7;

const rotateHandleOffset = 24;

function appendBoxHandles(parent: SVGElement, x: number, y: number, w: number, h: number, showRotate = false): void {
    const border = svgEl('rect');
    border.setAttribute('x', String(x - 1));
    border.setAttribute('y', String(y - 1));
    border.setAttribute('width', String(w + 2));
    border.setAttribute('height', String(h + 2));
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
    border.setAttribute('stroke-width', '1');
    border.setAttribute('stroke-dasharray', '4,3');
    border.setAttribute('pointer-events', 'none');
    parent.appendChild(border);

    const positions = [
        { pos: 'nw', cx: x, cy: y }, { pos: 'n', cx: x + w / 2, cy: y }, { pos: 'ne', cx: x + w, cy: y },
        { pos: 'e', cx: x + w, cy: y + h / 2 }, { pos: 'se', cx: x + w, cy: y + h },
        { pos: 's', cx: x + w / 2, cy: y + h }, { pos: 'sw', cx: x, cy: y + h }, { pos: 'w', cx: x, cy: y + h / 2 },
    ];
    for (const { pos, cx, cy } of positions) {
        const handle = svgEl('rect');
        handle.setAttribute('x', String(cx - handleSz / 2));
        handle.setAttribute('y', String(cy - handleSz / 2));
        handle.setAttribute('width', String(handleSz));
        handle.setAttribute('height', String(handleSz));
        handle.setAttribute('fill', '#ffffff');
        handle.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
        handle.setAttribute('stroke-width', '1.5');
        handle.setAttribute('rx', '1');
        handle.dataset.handle = pos;
        handle.style.cursor = getCursorForHandle(pos);
        parent.appendChild(handle);
    }

    if (showRotate) {
        const cx = x + w / 2;
        const cy = y - rotateHandleOffset;
        const stem = svgEl('line');
        stem.setAttribute('x1', String(cx));
        stem.setAttribute('y1', String(y - 1));
        stem.setAttribute('x2', String(cx));
        stem.setAttribute('y2', String(cy + 5));
        stem.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
        stem.setAttribute('stroke-width', '1');
        stem.setAttribute('pointer-events', 'none');
        parent.appendChild(stem);

        const circle = svgEl('circle');
        circle.setAttribute('cx', String(cx));
        circle.setAttribute('cy', String(cy));
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', '#ffffff');
        circle.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
        circle.setAttribute('stroke-width', '1.5');
        circle.dataset.handle = 'rotate';
        circle.style.cursor = 'grab';
        parent.appendChild(circle);
    }
}

function appendLineHandles(parent: SVGElement, x1: number, y1: number, x2: number, y2: number): void {
    for (const [hx, hy, pos] of [[x1, y1, 'start'], [x2, y2, 'end']] as [number, number, string][]) {
        const c = svgEl('circle');
        c.setAttribute('cx', String(hx));
        c.setAttribute('cy', String(hy));
        c.setAttribute('r', String(handleSz / 2 + 1));
        c.setAttribute('fill', '#ffffff');
        c.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
        c.setAttribute('stroke-width', '1.5');
        c.dataset.handle = pos;
        c.style.cursor = 'crosshair';
        parent.appendChild(c);
    }
}

function appendCurvedArrowHandles(parent: SVGElement, x1: number, y1: number, x2: number, y2: number, cpx: number, cpy: number): void {
    const cpLine1 = svgEl('line');
    cpLine1.setAttribute('x1', String(x1));
    cpLine1.setAttribute('y1', String(y1));
    cpLine1.setAttribute('x2', String(cpx));
    cpLine1.setAttribute('y2', String(cpy));
    cpLine1.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
    cpLine1.setAttribute('stroke-width', '0.5');
    cpLine1.setAttribute('stroke-dasharray', '3,3');
    cpLine1.setAttribute('pointer-events', 'none');
    parent.appendChild(cpLine1);

    const cpLine2 = svgEl('line');
    cpLine2.setAttribute('x1', String(x2));
    cpLine2.setAttribute('y1', String(y2));
    cpLine2.setAttribute('x2', String(cpx));
    cpLine2.setAttribute('y2', String(cpy));
    cpLine2.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
    cpLine2.setAttribute('stroke-width', '0.5');
    cpLine2.setAttribute('stroke-dasharray', '3,3');
    cpLine2.setAttribute('pointer-events', 'none');
    parent.appendChild(cpLine2);

    for (const [hx, hy, pos] of [[x1, y1, 'start'], [x2, y2, 'end'], [cpx, cpy, 'cp']] as [number, number, string][]) {
        const c = svgEl('circle');
        c.setAttribute('cx', String(hx));
        c.setAttribute('cy', String(hy));
        c.setAttribute('r', String(pos === 'cp' ? handleSz / 2 + 2 : handleSz / 2 + 1));
        c.setAttribute('fill', pos === 'cp' ? 'var(--eui-primary, #3b82f6)' : '#ffffff');
        c.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
        c.setAttribute('stroke-width', '1.5');
        c.dataset.handle = pos;
        c.style.cursor = 'crosshair';
        parent.appendChild(c);
    }
}

function getCursorForHandle(pos: string): string {
    const cursorMap: Record<string, string> = {
        nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize',
        se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize',
    };
    return cursorMap[pos] ?? 'pointer';
}

function renderObjectToSvg(
    parent: SVGGElement,
    obj: DrawObject,
    selected: boolean,
    scaleX: number,
    scaleY: number,
    defsEl: SVGDefsElement,
    rotation = 0,
): void {
    const g = svgEl('g');
    g.dataset.objId = obj.id;

    const sx = (v: number) => v * scaleX;
    const sy = (v: number) => v * scaleY;
    const sw = (v: number) => Math.max(1, v * Math.min(scaleX, scaleY));

    switch (obj.type) {
        case 'arrow':
        case 'line': {
            const line = svgEl('line');
            line.setAttribute('x1', String(sx(obj.x1)));
            line.setAttribute('y1', String(sy(obj.y1)));
            line.setAttribute('x2', String(sx(obj.x2)));
            line.setAttribute('y2', String(sy(obj.y2)));
            line.setAttribute('stroke', clr(obj.strokeColor));
            line.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            if (obj.type === 'arrow') {
                const markerId = `cd-ah-${obj.id}`;
                const marker = svgEl('marker');
                marker.setAttribute('id', markerId);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '7');
                marker.setAttribute('refX', '10');
                marker.setAttribute('refY', '3.5');
                marker.setAttribute('orient', 'auto');
                const poly = svgEl('polygon');
                poly.setAttribute('points', '0 0, 10 3.5, 0 7');
                poly.setAttribute('fill', clr(obj.strokeColor));
                marker.appendChild(poly);
                defsEl.appendChild(marker);
                line.setAttribute('marker-end', `url(#${markerId})`);
            }
            g.appendChild(line);
            const hit = svgEl('line');
            hit.setAttribute('x1', String(sx(obj.x1)));
            hit.setAttribute('y1', String(sy(obj.y1)));
            hit.setAttribute('x2', String(sx(obj.x2)));
            hit.setAttribute('y2', String(sy(obj.y2)));
            hit.setAttribute('stroke', 'transparent');
            hit.setAttribute('stroke-width', '12');
            hit.style.cursor = selected ? 'move' : 'pointer';
            hit.dataset.objId = obj.id;
            g.appendChild(hit);
            if (selected) appendLineHandles(g, sx(obj.x1), sy(obj.y1), sx(obj.x2), sy(obj.y2));
            break;
        }
        case 'rect': {
            const rect = svgEl('rect');
            rect.setAttribute('x', String(sx(obj.x)));
            rect.setAttribute('y', String(sy(obj.y)));
            rect.setAttribute('width', String(sx(obj.width)));
            rect.setAttribute('height', String(sy(obj.height)));
            rect.setAttribute('stroke', clr(obj.strokeColor));
            rect.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            rect.setAttribute('fill', obj.fillColor === 'transparent' ? 'none' : clr(obj.fillColor));
            if (obj.rounded) { rect.setAttribute('rx', String(sw(8))); rect.setAttribute('ry', String(sw(8))); }
            rect.style.cursor = selected ? 'move' : 'pointer';
            rect.dataset.objId = obj.id;
            g.appendChild(rect);
            if (selected) appendBoxHandles(g, sx(obj.x), sy(obj.y), sx(obj.width), sy(obj.height), true);
            break;
        }
        case 'circle': {
            const el = svgEl('ellipse');
            el.setAttribute('cx', String(sx(obj.x + obj.width / 2)));
            el.setAttribute('cy', String(sy(obj.y + obj.height / 2)));
            el.setAttribute('rx', String(Math.abs(sx(obj.width)) / 2));
            el.setAttribute('ry', String(Math.abs(sy(obj.height)) / 2));
            el.setAttribute('stroke', clr(obj.strokeColor));
            el.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            el.setAttribute('fill', obj.fillColor === 'transparent' ? 'none' : clr(obj.fillColor));
            el.style.cursor = selected ? 'move' : 'pointer';
            el.dataset.objId = obj.id;
            g.appendChild(el);
            if (selected) appendBoxHandles(g, sx(obj.x), sy(obj.y), sx(obj.width), sy(obj.height), true);
            break;
        }
        case 'freehand': {
            if (obj.points.length < 2) break;
            const d = obj.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x)},${sy(p.y)}`).join(' ');
            const path = svgEl('path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', clr(obj.strokeColor));
            path.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.style.cursor = selected ? 'move' : 'pointer';
            path.dataset.objId = obj.id;
            g.appendChild(path);
            if (selected) {
                const xs = obj.points.map((p) => p.x);
                const ys = obj.points.map((p) => p.y);
                appendBoxHandles(
                    g,
                    sx(Math.min(...xs)), sy(Math.min(...ys)),
                    sx(Math.max(...xs) - Math.min(...xs)), sy(Math.max(...ys) - Math.min(...ys)),
                    true,
                );
            }
            break;
        }
        case 'text': {
            const fo = svgEl('foreignObject');
            fo.setAttribute('x', String(sx(obj.x)));
            fo.setAttribute('y', String(sy(obj.y)));
            fo.setAttribute('width', String(sx(obj.width)));
            fo.setAttribute('height', String(sy(obj.height)));
            fo.style.overflow = 'visible';
            fo.style.cursor = selected ? 'move' : 'pointer';
            (fo as SVGElement & { dataset: DOMStringMap }).dataset.objId = obj.id;
            const div = document.createElement('div');
            const textBg = ('fillColor' in obj && obj.fillColor !== 'transparent') ? `background:${clr(obj.fillColor as string)};border-radius:4px;` : '';
            div.style.cssText = `width:100%;height:100%;padding:4px;box-sizing:border-box;font-family:${obj.fontFamily};font-size:${sw(obj.fontSize)}px;color:${clr(obj.fontColor)};word-wrap:break-word;white-space:pre-wrap;pointer-events:none;user-select:none;${textBg}${fontStyleStr(obj)}`;
            div.textContent = obj.text;
            fo.appendChild(div);
            g.appendChild(fo);
            if (selected) appendBoxHandles(g, sx(obj.x), sy(obj.y), sx(obj.width), sy(obj.height), true);
            break;
        }
        case 'balloon': {
            const { x, y, width: bw, height: bh } = obj;
            const rx2 = sw(8);
            const tailW = sw(16);
            const tailH = sw(14);
            const tailX = sx(x + bw / 2);
            const balloonPath = `M ${sx(x) + rx2} ${sy(y)} H ${sx(x + bw) - rx2} Q ${sx(x + bw)} ${sy(y)} ${sx(x + bw)} ${sy(y) + rx2} V ${sy(y + bh) - rx2} Q ${sx(x + bw)} ${sy(y + bh)} ${sx(x + bw) - rx2} ${sy(y + bh)} H ${tailX + tailW / 2} L ${tailX} ${sy(y + bh) + tailH} L ${tailX - tailW / 2} ${sy(y + bh)} H ${sx(x) + rx2} Q ${sx(x)} ${sy(y + bh)} ${sx(x)} ${sy(y + bh) - rx2} V ${sy(y) + rx2} Q ${sx(x)} ${sy(y)} ${sx(x) + rx2} ${sy(y)} Z`;
            const path = svgEl('path');
            path.setAttribute('d', balloonPath);
            path.setAttribute('stroke', clr(obj.strokeColor));
            path.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            path.setAttribute('fill', obj.fillColor === 'transparent' ? 'none' : clr(obj.fillColor));
            path.style.cursor = selected ? 'move' : 'pointer';
            path.dataset.objId = obj.id;
            g.appendChild(path);
            const fo = svgEl('foreignObject');
            fo.setAttribute('x', String(sx(x) + sw(6)));
            fo.setAttribute('y', String(sy(y) + sw(4)));
            fo.setAttribute('width', String(Math.max(sx(bw) - sw(12), 20)));
            fo.setAttribute('height', String(Math.max(sy(bh) - sw(8), 20)));
            fo.style.overflow = 'visible';
            fo.style.pointerEvents = 'none';
            const fc = autoFontColor(obj.fillColor, obj.fontColor);
            const div = document.createElement('div');
            div.style.cssText = `width:100%;height:100%;box-sizing:border-box;font-family:${obj.fontFamily};font-size:${sw(obj.fontSize)}px;color:${fc};word-wrap:break-word;white-space:pre-wrap;user-select:none;${fontStyleStr(obj)}`;
            div.textContent = obj.text;
            fo.appendChild(div);
            g.appendChild(fo);
            if (selected) appendBoxHandles(g, sx(x), sy(y), sx(bw), sy(bh), true);
            break;
        }
        case 'step': {
            const circle = svgEl('circle');
            circle.setAttribute('cx', String(sx(obj.x)));
            circle.setAttribute('cy', String(sy(obj.y)));
            circle.setAttribute('r', String(sw(obj.radius)));
            circle.setAttribute('fill', clr(obj.fillColor));
            circle.setAttribute('stroke', clr(obj.strokeColor));
            circle.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            circle.style.cursor = selected ? 'move' : 'pointer';
            circle.dataset.objId = obj.id;
            g.appendChild(circle);
            const fc2 = autoFontColor(obj.fillColor, obj.fontColor);
            const txt = svgEl('text');
            txt.setAttribute('x', String(sx(obj.x)));
            txt.setAttribute('y', String(sy(obj.y) + 1));
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('dominant-baseline', 'middle');
            txt.setAttribute('fill', fc2);
            txt.setAttribute('font-size', String(Math.max(sw(obj.radius) * 0.9, 10)));
            txt.setAttribute('font-weight', '700');
            txt.setAttribute('font-family', 'sans-serif');
            txt.setAttribute('pointer-events', 'none');
            txt.textContent = String(obj.stepNumber);
            g.appendChild(txt);
            if (selected) {
                const r = sw(obj.radius);
                appendBoxHandles(g, sx(obj.x) - r, sy(obj.y) - r, r * 2, r * 2, true);
            }
            break;
        }
        case 'highlighter': {
            if (obj.points.length < 2) break;
            const d = obj.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x)},${sy(p.y)}`).join(' ');
            const path = svgEl('path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', clr(obj.strokeColor));
            path.setAttribute('stroke-width', String(Math.max(sw(obj.strokeWidth) * 6, 12)));
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.setAttribute('opacity', '0.35');
            path.style.cursor = selected ? 'move' : 'pointer';
            path.dataset.objId = obj.id;
            g.appendChild(path);
            if (selected) {
                const xs2 = obj.points.map((p) => p.x);
                const ys2 = obj.points.map((p) => p.y);
                appendBoxHandles(
                    g,
                    sx(Math.min(...xs2)), sy(Math.min(...ys2)),
                    sx(Math.max(...xs2) - Math.min(...xs2)), sy(Math.max(...ys2) - Math.min(...ys2)),
                    true,
                );
            }
            break;
        }
        case 'callout': {
            const lineEl = svgEl('line');
            lineEl.setAttribute('x1', String(sx(obj.x1)));
            lineEl.setAttribute('y1', String(sy(obj.y1)));
            lineEl.setAttribute('x2', String(sx(obj.x2)));
            lineEl.setAttribute('y2', String(sy(obj.y2)));
            lineEl.setAttribute('stroke', clr(obj.strokeColor));
            lineEl.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            g.appendChild(lineEl);
            const hitLine = svgEl('line');
            hitLine.setAttribute('x1', String(sx(obj.x1)));
            hitLine.setAttribute('y1', String(sy(obj.y1)));
            hitLine.setAttribute('x2', String(sx(obj.x2)));
            hitLine.setAttribute('y2', String(sy(obj.y2)));
            hitLine.setAttribute('stroke', 'transparent');
            hitLine.setAttribute('stroke-width', '12');
            hitLine.style.cursor = selected ? 'move' : 'pointer';
            hitLine.dataset.objId = obj.id;
            g.appendChild(hitLine);
            const dotR = sw(obj.radius);
            const dotEl = svgEl('circle');
            dotEl.setAttribute('cx', String(sx(obj.x1)));
            dotEl.setAttribute('cy', String(sy(obj.y1)));
            dotEl.setAttribute('r', String(Math.max(dotR * 0.15, 4)));
            dotEl.setAttribute('fill', clr(obj.strokeColor));
            g.appendChild(dotEl);
            const circleEl = svgEl('circle');
            circleEl.setAttribute('cx', String(sx(obj.x2)));
            circleEl.setAttribute('cy', String(sy(obj.y2)));
            circleEl.setAttribute('r', String(dotR));
            circleEl.setAttribute('fill', clr(obj.fillColor));
            circleEl.setAttribute('stroke', clr(obj.strokeColor));
            circleEl.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            circleEl.style.cursor = selected ? 'move' : 'pointer';
            circleEl.dataset.objId = obj.id;
            g.appendChild(circleEl);
            const fc3 = autoFontColor(obj.fillColor, obj.fontColor);
            const numTxt = svgEl('text');
            numTxt.setAttribute('x', String(sx(obj.x2)));
            numTxt.setAttribute('y', String(sy(obj.y2) + 1));
            numTxt.setAttribute('text-anchor', 'middle');
            numTxt.setAttribute('dominant-baseline', 'middle');
            numTxt.setAttribute('fill', fc3);
            numTxt.setAttribute('font-size', String(Math.max(dotR * 0.75, 12)));
            numTxt.setAttribute('font-weight', '700');
            numTxt.setAttribute('font-family', 'sans-serif');
            numTxt.setAttribute('pointer-events', 'none');
            numTxt.textContent = String(obj.stepNumber);
            g.appendChild(numTxt);
            if (selected) {
                const selLine = svgEl('line');
                selLine.setAttribute('x1', String(sx(obj.x1)));
                selLine.setAttribute('y1', String(sy(obj.y1)));
                selLine.setAttribute('x2', String(sx(obj.x2)));
                selLine.setAttribute('y2', String(sy(obj.y2)));
                selLine.setAttribute('stroke', 'var(--eui-primary, #3b82f6)');
                selLine.setAttribute('stroke-width', '1');
                selLine.setAttribute('stroke-dasharray', '4,3');
                selLine.setAttribute('pointer-events', 'none');
                g.appendChild(selLine);
                appendLineHandles(g, sx(obj.x1), sy(obj.y1), sx(obj.x2), sy(obj.y2));
            }
            break;
        }
        case 'dimension': {
            const dx = sx(obj.x2) - sx(obj.x1);
            const dy = sy(obj.y2) - sy(obj.y1);
            const len = Math.sqrt(dx * dx + dy * dy);
            const perpX = len > 0 ? -dy / len : 0;
            const perpY = len > 0 ? dx / len : 1;
            const capLen = 6;
            const line2 = svgEl('line');
            line2.setAttribute('x1', String(sx(obj.x1)));
            line2.setAttribute('y1', String(sy(obj.y1)));
            line2.setAttribute('x2', String(sx(obj.x2)));
            line2.setAttribute('y2', String(sy(obj.y2)));
            line2.setAttribute('stroke', clr(obj.strokeColor));
            line2.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            g.appendChild(line2);
            for (const [ex, ey] of [[sx(obj.x1), sy(obj.y1)], [sx(obj.x2), sy(obj.y2)]]) {
                const cap = svgEl('line');
                cap.setAttribute('x1', String(ex + perpX * capLen));
                cap.setAttribute('y1', String(ey + perpY * capLen));
                cap.setAttribute('x2', String(ex - perpX * capLen));
                cap.setAttribute('y2', String(ey - perpY * capLen));
                cap.setAttribute('stroke', clr(obj.strokeColor));
                cap.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
                g.appendChild(cap);
            }
            const midX = (sx(obj.x1) + sx(obj.x2)) / 2;
            const midY = (sy(obj.y1) + sy(obj.y2)) / 2;
            const dimLabel = svgEl('text');
            dimLabel.setAttribute('x', String(midX + perpX * 12));
            dimLabel.setAttribute('y', String(midY + perpY * 12));
            dimLabel.setAttribute('text-anchor', 'middle');
            dimLabel.setAttribute('dominant-baseline', 'middle');
            dimLabel.setAttribute('fill', clr(obj.strokeColor));
            dimLabel.setAttribute('font-size', '11');
            dimLabel.setAttribute('font-family', 'sans-serif');
            dimLabel.setAttribute('font-weight', '600');
            dimLabel.setAttribute('pointer-events', 'none');
            dimLabel.textContent = obj.customLabel ?? `${Math.round(len)}px`;
            g.appendChild(dimLabel);
            const hitLine2 = svgEl('line');
            hitLine2.setAttribute('x1', String(sx(obj.x1)));
            hitLine2.setAttribute('y1', String(sy(obj.y1)));
            hitLine2.setAttribute('x2', String(sx(obj.x2)));
            hitLine2.setAttribute('y2', String(sy(obj.y2)));
            hitLine2.setAttribute('stroke', 'transparent');
            hitLine2.setAttribute('stroke-width', '12');
            hitLine2.style.cursor = selected ? 'move' : 'pointer';
            hitLine2.dataset.objId = obj.id;
            g.appendChild(hitLine2);
            if (selected) appendLineHandles(g, sx(obj.x1), sy(obj.y1), sx(obj.x2), sy(obj.y2));
            break;
        }
        case 'curvedArrow': {
            const markerId = `cd-cah-${obj.id}`;
            const marker = svgEl('marker');
            marker.setAttribute('id', markerId);
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            const poly = svgEl('polygon');
            poly.setAttribute('points', '0 0, 10 3.5, 0 7');
            poly.setAttribute('fill', clr(obj.strokeColor));
            marker.appendChild(poly);
            defsEl.appendChild(marker);
            const pathD = `M ${sx(obj.x1)} ${sy(obj.y1)} Q ${sx(obj.cpx)} ${sy(obj.cpy)} ${sx(obj.x2)} ${sy(obj.y2)}`;
            const curvePath = svgEl('path');
            curvePath.setAttribute('d', pathD);
            curvePath.setAttribute('stroke', clr(obj.strokeColor));
            curvePath.setAttribute('stroke-width', String(sw(obj.strokeWidth)));
            curvePath.setAttribute('fill', 'none');
            curvePath.setAttribute('marker-end', `url(#${markerId})`);
            g.appendChild(curvePath);
            const hitPath = svgEl('path');
            hitPath.setAttribute('d', pathD);
            hitPath.setAttribute('stroke', 'transparent');
            hitPath.setAttribute('stroke-width', '12');
            hitPath.setAttribute('fill', 'none');
            hitPath.style.cursor = selected ? 'move' : 'pointer';
            hitPath.dataset.objId = obj.id;
            g.appendChild(hitPath);
            if (selected) appendCurvedArrowHandles(g, sx(obj.x1), sy(obj.y1), sx(obj.x2), sy(obj.y2), sx(obj.cpx), sy(obj.cpy));
            break;
        }
    }

    const isLineType = obj.type === 'arrow' || obj.type === 'line' || obj.type === 'dimension' || obj.type === 'callout' || obj.type === 'curvedArrow';
    if (rotation && !isLineType) {
        const bbox = getObjectCenter(obj, sx, sy);
        g.setAttribute('transform', `rotate(${rotation} ${bbox.cx} ${bbox.cy})`);
    }

    parent.appendChild(g);
}

function getObjectCenter(obj: DrawObject, sx: (v: number) => number, sy: (v: number) => number): { cx: number; cy: number } {
    if ('width' in obj && 'height' in obj && 'x' in obj && 'y' in obj) {
        const o = obj as { x: number; y: number; width: number; height: number };
        return { cx: sx(o.x) + sx(o.width) / 2, cy: sy(o.y) + sy(o.height) / 2 };
    }
    if (obj.type === 'step') {
        return { cx: sx(obj.x), cy: sy(obj.y) };
    }
    if (obj.type === 'freehand') {
        const xs = obj.points.map((p) => p.x);
        const ys = obj.points.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        return { cx: sx((minX + maxX) / 2), cy: sy((minY + maxY) / 2) };
    }
    return { cx: 0, cy: 0 };
}

function applyDrag(item: DrawItem, dxPct: number, dyPct: number): DrawItem {
    const obj = item.object;
    if (obj.type === 'freehand' || obj.type === 'highlighter') {
        const pts = (obj as { points: DrawPoint[] }).points;
        return { ...item, xPct: item.xPct + dxPct, yPct: item.yPct + dyPct, object: { ...obj, points: pts.map((p) => ({ x: p.x + dxPct, y: p.y + dyPct })) } };
    }
    if (obj.type === 'arrow' || obj.type === 'line' || obj.type === 'dimension') {
        return { ...item, xPct: item.xPct + dxPct, yPct: item.yPct + dyPct, object: { ...obj, x1: obj.x1 + dxPct, y1: obj.y1 + dyPct, x2: obj.x2 + dxPct, y2: obj.y2 + dyPct } };
    }
    if (obj.type === 'callout') {
        return { ...item, xPct: item.xPct + dxPct, yPct: item.yPct + dyPct, object: { ...obj, x1: obj.x1 + dxPct, y1: obj.y1 + dyPct, x2: obj.x2 + dxPct, y2: obj.y2 + dyPct } };
    }
    if (obj.type === 'curvedArrow') {
        return { ...item, xPct: item.xPct + dxPct, yPct: item.yPct + dyPct, object: { ...obj, x1: obj.x1 + dxPct, y1: obj.y1 + dyPct, x2: obj.x2 + dxPct, y2: obj.y2 + dyPct, cpx: obj.cpx + dxPct, cpy: obj.cpy + dyPct } };
    }
    if ('x' in obj && 'y' in obj) {
        return { ...item, xPct: item.xPct + dxPct, yPct: item.yPct + dyPct, object: { ...obj, x: (obj as { x: number }).x + dxPct, y: (obj as { y: number }).y + dyPct } };
    }
    return item;
}

function applyResize(item: DrawItem, handle: string, dxPct: number, dyPct: number): DrawItem {
    const obj = item.object;
    if (obj.type === 'arrow' || obj.type === 'line' || obj.type === 'dimension') {
        if (handle === 'end') return { ...item, wPct: (item.wPct ?? 0) + dxPct, hPct: (item.hPct ?? 0) + dyPct, object: { ...obj, x2: obj.x2 + dxPct, y2: obj.y2 + dyPct } };
        if (handle === 'start') return { ...item, xPct: item.xPct + dxPct, yPct: item.yPct + dyPct, object: { ...obj, x1: obj.x1 + dxPct, y1: obj.y1 + dyPct } };
    }
    if (obj.type === 'callout') {
        if (handle === 'end') return { ...item, object: { ...obj, x2: obj.x2 + dxPct, y2: obj.y2 + dyPct } };
        if (handle === 'start') return { ...item, object: { ...obj, x1: obj.x1 + dxPct, y1: obj.y1 + dyPct } };
    }
    if (obj.type === 'curvedArrow') {
        if (handle === 'end') return { ...item, wPct: (item.wPct ?? 0) + dxPct, hPct: (item.hPct ?? 0) + dyPct, object: { ...obj, x2: obj.x2 + dxPct, y2: obj.y2 + dyPct } };
        if (handle === 'start') return { ...item, xPct: item.xPct + dxPct, yPct: item.yPct + dyPct, object: { ...obj, x1: obj.x1 + dxPct, y1: obj.y1 + dyPct } };
        if (handle === 'cp') return { ...item, object: { ...obj, cpx: obj.cpx + dxPct, cpy: obj.cpy + dyPct } };
    }
    if (obj.type === 'step') {
        const currentR = (item.wPct ?? 0.04) / 2;
        const delta = Math.max(Math.abs(dxPct), Math.abs(dyPct));
        const expanding = (handle.includes('e') && dxPct > 0) || (handle.includes('s') && dyPct > 0)
            || (handle.includes('w') && dxPct < 0) || (handle.includes('n') && dyPct < 0);
        const newR = Math.max(0.008, currentR + (expanding ? delta : -delta));
        return { ...item, wPct: newR * 2, hPct: newR * 2, object: { ...obj, radius: newR } };
    }
    if (obj.type === 'freehand' || obj.type === 'highlighter') {
        const pts = obj.points;
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const origW = maxX - minX || 0.001;
        const origH = maxY - minY || 0.001;
        let newMinX = minX, newMinY = minY, newW = origW, newH = origH;
        if (handle.includes('e')) newW += dxPct;
        if (handle.includes('s')) newH += dyPct;
        if (handle.includes('w')) { newMinX += dxPct; newW -= dxPct; }
        if (handle.includes('n')) { newMinY += dyPct; newH -= dyPct; }
        if (newW < 0.001) newW = 0.001;
        if (newH < 0.001) newH = 0.001;
        const scaleXf = newW / origW;
        const scaleYf = newH / origH;
        const newPts = pts.map((p) => ({
            x: newMinX + (p.x - minX) * scaleXf,
            y: newMinY + (p.y - minY) * scaleYf,
        }));
        return { ...item, xPct: newMinX, yPct: newMinY, wPct: newW, hPct: newH, object: { ...obj, points: newPts } };
    }
    if ('width' in obj && 'height' in obj && 'x' in obj && 'y' in obj) {
        const o = obj as { x: number; y: number; width: number; height: number };
        let { x, y, width: w, height: h } = o;
        if (handle.includes('e')) w += dxPct;
        if (handle.includes('s')) h += dyPct;
        if (handle.includes('w')) { x += dxPct; w -= dxPct; }
        if (handle.includes('n')) { y += dyPct; h -= dyPct; }
        return { ...item, xPct: x, yPct: y, wPct: w, hPct: h, object: { ...obj, x, y, width: w, height: h } };
    }
    return item;
}

export interface CanvasDrawOverlayHandle {
    getItems: () => DrawItem[];
    getGroups: () => DrawGroup[];
    exportSvgString: () => string;
}

interface Props {
    background: CanvasBackground;
    currentMs: number;
    isEditing: boolean;
    items: DrawItem[];
    groups: DrawGroup[];
    selectedItemId: string | null;
    defaults: DrawToolDefaults;
    activeTool: DrawTool;
    currentDrawShowAt: number;
    currentDrawHideAt: number | null;
    currentDrawTransition: DrawTransition;
    currentDrawGroupId: string | null;
    onItemsChange: (items: DrawItem[]) => void;
    onItemsCommit: () => void;
    onSelectItem: (id: string | null) => void;
    onDrawComplete?: () => void;
}

const CanvasDrawOverlay = forwardRef<CanvasDrawOverlayHandle, Props>(function CanvasDrawOverlay(props, ref) {
    const {
        background, currentMs, isEditing, items, groups,
        selectedItemId, defaults, activeTool,
        currentDrawShowAt, currentDrawHideAt, currentDrawTransition, currentDrawGroupId,
        onItemsChange, onItemsCommit, onSelectItem, onDrawComplete,
    } = props;

    const svgRef = useRef<SVGSVGElement | null>(null);
    const boundsRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const [boundsVersion, setBoundsVersion] = useState(0);
    const drawingRef = useRef(false);
    const startPctRef = useRef({ x: 0, y: 0 });
    const currentObjRef = useRef<DrawItem | null>(null);
    const dragRef = useRef<{ itemId: string; startPx: { x: number; y: number }; origItem: DrawItem } | null>(null);
    const resizeRef = useRef<{ itemId: string; handle: string; startPx: { x: number; y: number }; origItem: DrawItem } | null>(null);
    const rotateRef = useRef<{ itemId: string; centerPx: { cx: number; cy: number }; startAngle: number; origRotation: number } | null>(null);
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const activeToolRef = useRef(activeTool);
    activeToolRef.current = activeTool;

    useImperativeHandle(ref, () => ({
        getItems: () => items,
        getGroups: () => groups,
        exportSvgString: () => svgRef.current?.outerHTML ?? '',
    }));

    const updateBounds = useCallback(() => {
        const svg = svgRef.current;
        if (!svg) return;

        let boundsW: number;
        let boundsH: number;
        let offsetX = 0;
        let offsetY = 0;

        if (background.type === 'video') {
            const video = background.videoRef.current;
            if (!video) return;
            const b = getVideoBounds(video);
            boundsW = b.w;
            boundsH = b.h;
            offsetX = b.x;
            offsetY = b.y;

            const videoRect = video.getBoundingClientRect();
            const wrapEl = svg.parentElement;
            if (!wrapEl) return;
            const wrapRect = wrapEl.getBoundingClientRect();
            svg.style.left = `${(videoRect.left - wrapRect.left) + offsetX}px`;
            svg.style.top = `${(videoRect.top - wrapRect.top) + offsetY}px`;
        } else {
            const parent = svg.parentElement;
            if (!parent) return;
            boundsW = parent.clientWidth;
            boundsH = parent.clientHeight;
            svg.style.left = '0px';
            svg.style.top = '0px';
        }

        const prev = boundsRef.current;
        boundsRef.current = { x: offsetX, y: offsetY, w: boundsW, h: boundsH };
        svg.style.width = `${boundsW}px`;
        svg.style.height = `${boundsH}px`;
        svg.setAttribute('viewBox', `0 0 ${boundsW} ${boundsH}`);
        if (!prev || prev.w !== boundsW || prev.h !== boundsH) {
            setBoundsVersion((v) => v + 1);
        }
    }, [background]);

    useEffect(() => {
        if (background.type === 'video') {
            const video = background.videoRef.current;
            if (!video) return;

            const update = () => updateBounds();
            video.addEventListener('loadedmetadata', update);
            video.addEventListener('resize', update);
            const ro = new ResizeObserver(() => updateBounds());
            ro.observe(video);
            if (video.parentElement) ro.observe(video.parentElement);
            updateBounds();

            return () => {
                video.removeEventListener('loadedmetadata', update);
                video.removeEventListener('resize', update);
                ro.disconnect();
            };
        } else {
            const parent = svgRef.current?.parentElement;
            if (!parent) return;
            const ro = new ResizeObserver(() => updateBounds());
            ro.observe(parent);
            updateBounds();
            return () => ro.disconnect();
        }
    }, [background, updateBounds]);

    useEffect(() => {
        const onFullscreen = () => setTimeout(() => updateBounds(), 100);
        document.addEventListener('fullscreenchange', onFullscreen);
        document.addEventListener('webkitfullscreenchange', onFullscreen);
        return () => {
            document.removeEventListener('fullscreenchange', onFullscreen);
            document.removeEventListener('webkitfullscreenchange', onFullscreen);
        };
    }, [updateBounds]);

    const getItemVisible = useCallback((item: DrawItem, ms: number): boolean => {
        if (item.showAtMs > ms) return false;
        if (item.hideAtMs !== null && ms >= item.hideAtMs) return false;
        if (item.groupId) {
            const group = groups.find((g) => g.id === item.groupId);
            if (group) {
                if (group.showAtMs > ms) return false;
                if (group.hideAtMs !== null && ms >= group.hideAtMs) return false;
            }
        }
        return true;
    }, [groups]);

    const svgPxToPct = useCallback((svgX: number, svgY: number): { xPct: number; yPct: number } => {
        const b = boundsRef.current;
        if (!b || b.w === 0 || b.h === 0) return { xPct: 0, yPct: 0 };
        return { xPct: svgX / b.w, yPct: svgY / b.h };
    }, []);

    const eventToSvgPx = useCallback((e: MouseEvent | React.MouseEvent): { x: number; y: number } | null => {
        const svg = svgRef.current;
        if (!svg) return null;
        const svgRect = svg.getBoundingClientRect();
        return { x: e.clientX - svgRect.left, y: e.clientY - svgRect.top };
    }, []);

    const itemObjectToScaled = useCallback((item: DrawItem): DrawObject => {
        const b = boundsRef.current;
        if (!b) return item.object;
        const sX = b.w;
        const sY = b.h;
        const obj = { ...item.object };
        if (obj.type === 'curvedArrow') {
            return { ...obj, x1: obj.x1 * sX, y1: obj.y1 * sY, x2: obj.x2 * sX, y2: obj.y2 * sY, cpx: obj.cpx * sX, cpy: obj.cpy * sY };
        }
        if (obj.type === 'callout') {
            return { ...obj, x1: obj.x1 * sX, y1: obj.y1 * sY, x2: obj.x2 * sX, y2: obj.y2 * sY, radius: (obj.radius) * Math.min(sX, sY) };
        }
        if ('x1' in obj) {
            return { ...obj, x1: item.xPct * sX, y1: item.yPct * sY, x2: (item.xPct + (item.wPct ?? 0)) * sX, y2: (item.yPct + (item.hPct ?? 0)) * sY };
        }
        if ('points' in obj) {
            const pts = (obj as { points: DrawPoint[] }).points;
            return { ...obj, points: pts.map((p) => ({ x: p.x * sX, y: p.y * sY })) };
        }
        if ('x' in obj && 'y' in obj) {
            const o2 = obj as { x: number; y: number; width?: number; height?: number; radius?: number };
            return {
                ...obj,
                x: item.xPct * sX,
                y: item.yPct * sY,
                ...(o2.width !== undefined ? { width: (item.wPct ?? 0) * sX, height: (item.hPct ?? 0) * sY } : {}),
                ...(o2.radius !== undefined ? { radius: (item.wPct ?? 0.05) * Math.min(sX, sY) / 2 } : {}),
            } as DrawObject;
        }
        return obj as DrawObject;
    }, []);

    const rebuildSvg = useCallback(() => {
        const svg = svgRef.current;
        if (!svg || !boundsRef.current) return;

        while (svg.lastChild) svg.removeChild(svg.lastChild);
        const defs = svgEl('defs');
        svg.appendChild(defs);

        for (const item of items) {
            const scaledObj = itemObjectToScaled(item);
            const selected = isEditing && item.id === selectedItemId;
            const groupEl = svgEl('g');
            groupEl.dataset.cdItemId = item.id;
            if (!isEditing && item.transition !== 'none') {
                groupEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            }
            renderObjectToSvg(groupEl, scaledObj, selected, 1, 1, defs, item.rotation ?? 0);
            svg.appendChild(groupEl);
        }
    }, [items, isEditing, selectedItemId, itemObjectToScaled, boundsVersion]);

    const updateVisibility = useCallback(() => {
        const svg = svgRef.current;
        const b = boundsRef.current;
        if (!svg || !b) return;

        const groupEls = svg.querySelectorAll<SVGGElement>(':scope > g[data-cd-item-id]');
        groupEls.forEach((groupEl) => {
            const itemId = groupEl.dataset.cdItemId;
            const item = items.find((it) => it.id === itemId);
            if (!item) { groupEl.style.display = 'none'; return; }

            const visible = getItemVisible(item, currentMs);

            if (isEditing) {
                groupEl.style.display = '';
                groupEl.style.opacity = visible ? '1' : '0.3';
                groupEl.style.transform = '';
            } else {
                const transition = item.transition;
                if (transition !== 'none') {
                    groupEl.style.display = '';
                    groupEl.style.opacity = visible ? '1' : '0';
                    if (transition === 'scale') {
                        groupEl.style.transform = visible ? 'scale(1)' : 'scale(0.5)';
                        groupEl.style.transformOrigin = `${item.xPct * b.w + (item.wPct ?? 0.05) * b.w / 2}px ${item.yPct * b.h + (item.hPct ?? 0.05) * b.h / 2}px`;
                    } else if (transition === 'slide-up') {
                        groupEl.style.transform = visible ? 'translateY(0)' : 'translateY(20px)';
                    } else if (transition === 'slide-down') {
                        groupEl.style.transform = visible ? 'translateY(0)' : 'translateY(-20px)';
                    } else if (transition === 'slide-left') {
                        groupEl.style.transform = visible ? 'translateX(0)' : 'translateX(20px)';
                    } else if (transition === 'slide-right') {
                        groupEl.style.transform = visible ? 'translateX(0)' : 'translateX(-20px)';
                    } else {
                        groupEl.style.transform = '';
                    }
                } else {
                    groupEl.style.display = visible ? '' : 'none';
                    groupEl.style.opacity = '';
                    groupEl.style.transform = '';
                }
            }
        });
    }, [items, currentMs, isEditing, getItemVisible]);

    useEffect(() => {
        rebuildSvg();
        updateVisibility();
    }, [rebuildSvg]);

    useEffect(() => {
        updateVisibility();
    }, [updateVisibility]);

    const openInlineTextEditor = useCallback((
        itemId: string,
        obj: DrawObject,
        svgX: number,
        svgY: number,
        isExisting = false,
    ) => {
        const svg = svgRef.current;
        if (!svg) return;
        const svgRect = svg.getBoundingClientRect();
        const existingText = (obj as { text?: string }).text ?? '';

        const inputEl = document.createElement('textarea');
        inputEl.value = isExisting ? existingText : '';
        inputEl.style.cssText = `
            position:fixed;
            left:${svgRect.left + svgX}px;
            top:${svgRect.top + svgY}px;
            width:160px;height:60px;
            font-size:13px;font-family:sans-serif;
            background:#fff;color:#111;border:2px solid var(--eui-primary, #3b82f6);
            border-radius:4px;padding:4px;outline:none;resize:both;z-index:9999;
        `;
        document.body.appendChild(inputEl);
        inputEl.focus();
        if (isExisting) inputEl.select();

        let committed = false;
        const commit = () => {
            if (committed) return;
            committed = true;
            const text = inputEl.value.trim();
            inputEl.remove();

            if (isExisting) {
                if (text) {
                    const updated = { ...obj, text } as DrawObject;
                    onItemsChange(itemsRef.current.map((it) => it.id === itemId ? { ...it, object: updated } : it));
                }
            } else {
                const newObj = { ...obj, text } as DrawObject;
                const newItem: DrawItem = {
                    id: itemId,
                    object: newObj,
                    showAtMs: currentDrawShowAt,
                    hideAtMs: currentDrawHideAt,
                    transition: currentDrawTransition,
                    groupId: currentDrawGroupId,
                    xPct: (obj as { x: number }).x,
                    yPct: (obj as { y: number }).y,
                    wPct: 0.15,
                    hPct: 0.06,
                };
                if (text) {
                    onItemsChange([...itemsRef.current, newItem]);
                    onSelectItem(itemId);
                }
            }
        };

        inputEl.addEventListener('blur', commit);
        inputEl.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') { inputEl.value = isExisting ? existingText : ''; inputEl.blur(); }
            if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); commit(); }
        });
    }, [currentDrawShowAt, currentDrawHideAt, currentDrawTransition, currentDrawGroupId, onItemsChange, onSelectItem]);

    const openDimensionLabelEditor = useCallback((itemId: string, obj: DrawObject, svgX: number, svgY: number) => {
        const svg = svgRef.current;
        if (!svg || obj.type !== 'dimension') return;
        const svgRect = svg.getBoundingClientRect();
        const currentLabel = obj.customLabel ?? '';

        const inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.value = currentLabel;
        inputEl.placeholder = 'auto';
        inputEl.style.cssText = `
            position:fixed;
            left:${svgRect.left + svgX - 50}px;
            top:${svgRect.top + svgY - 14}px;
            width:100px;height:28px;
            font-size:12px;font-family:sans-serif;
            background:#fff;color:#111;border:2px solid var(--eui-primary, #3b82f6);
            border-radius:4px;padding:2px 6px;outline:none;text-align:center;z-index:9999;
        `;
        document.body.appendChild(inputEl);
        inputEl.focus();
        inputEl.select();

        let committed = false;
        const commit = () => {
            if (committed) return;
            committed = true;
            const val = inputEl.value.trim();
            inputEl.remove();
            const updated = { ...obj, customLabel: val || undefined } as DrawObject;
            onItemsChange(itemsRef.current.map((it) => it.id === itemId ? { ...it, object: updated } : it));
        };

        inputEl.addEventListener('blur', commit);
        inputEl.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') { inputEl.value = currentLabel; inputEl.blur(); }
            if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
        });
    }, [onItemsChange]);

    const onDoubleClick = useCallback((e: React.MouseEvent) => {
        if (!isEditing || activeTool !== 'select') return;
        const target = e.target as Element;
        const cdItemId = target.closest('[data-cd-item-id]')?.getAttribute('data-cd-item-id');
        if (!cdItemId) return;
        const item = itemsRef.current.find((it) => it.id === cdItemId);
        if (!item) return;
        e.preventDefault();
        e.stopPropagation();
        const pos = eventToSvgPx(e);
        if (!pos) return;
        if (item.object.type === 'dimension') {
            openDimensionLabelEditor(cdItemId, item.object, pos.x, pos.y);
            return;
        }
        if (item.object.type !== 'text' && item.object.type !== 'balloon') return;
        openInlineTextEditor(cdItemId, item.object, pos.x, pos.y, true);
    }, [isEditing, activeTool, eventToSvgPx, openInlineTextEditor, openDimensionLabelEditor]);

    const completeDrawing = useCallback(() => {
        activeToolRef.current = 'select';
        onDrawComplete?.();
    }, [onDrawComplete]);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation();

        const pos = eventToSvgPx(e);
        if (!pos) return;
        const b = boundsRef.current;
        if (!b) return;
        if (pos.x < 0 || pos.y < 0 || pos.x > b.w || pos.y > b.h) return;

        const { x, y } = pos;
        const currentItems = itemsRef.current;
        const target = e.target as SVGElement;
        const objId = target.dataset?.objId ?? target.closest('[data-obj-id]')?.getAttribute('data-obj-id');
        const cdItemId = target.closest('[data-cd-item-id]')?.getAttribute('data-cd-item-id');
        const handlePos = target.dataset?.handle;

        const tool = activeToolRef.current;

        if (tool === 'select') {
            if (handlePos === 'rotate' && cdItemId) {
                const item = currentItems.find((it) => it.id === cdItemId);
                if (item) {
                    const scaledObj = itemObjectToScaled(item);
                    const identity = (v: number) => v;
                    const center = getObjectCenter(scaledObj, identity, identity);
                    const startAngle = Math.atan2(y - center.cy, x - center.cx) * (180 / Math.PI);
                    rotateRef.current = { itemId: cdItemId, centerPx: center, startAngle, origRotation: item.rotation ?? 0 };
                }
                return;
            }
            if (handlePos && cdItemId) {
                const item = currentItems.find((it) => it.id === cdItemId);
                if (item) {
                    resizeRef.current = { itemId: cdItemId, handle: handlePos, startPx: { x, y }, origItem: { ...item, object: { ...item.object } } };
                }
                return;
            }
            if (cdItemId || objId) {
                const id = cdItemId ?? objId!;
                onSelectItem(id);
                const item = currentItems.find((it) => it.id === id);
                if (item) {
                    dragRef.current = { itemId: id, startPx: { x, y }, origItem: { ...item, object: { ...item.object } } };
                }
                return;
            }
            onSelectItem(null);
            return;
        }

        const { xPct, yPct } = svgPxToPct(x, y);
        const newId = uid();
        drawingRef.current = true;
        startPctRef.current = { x: xPct, y: yPct };

        let newObj: DrawObject;
        const strokeW = defaults.strokeWidth;
        const sc = defaults.strokeColor;

        if (tool === 'freehand') {
            newObj = { id: newId, type: 'freehand', strokeColor: sc, strokeWidth: strokeW, points: [{ x: xPct, y: yPct }] };
        } else if (tool === 'arrow') {
            newObj = { id: newId, type: 'arrow', strokeColor: sc, strokeWidth: strokeW, x1: xPct, y1: yPct, x2: xPct, y2: yPct, arrowheadStyle: defaults.arrowheadStyle };
        } else if (tool === 'line') {
            newObj = { id: newId, type: 'line', strokeColor: sc, strokeWidth: strokeW, x1: xPct, y1: yPct, x2: xPct, y2: yPct };
        } else if (tool === 'rect') {
            newObj = { id: newId, type: 'rect', strokeColor: sc, strokeWidth: strokeW, x: xPct, y: yPct, width: 0, height: 0, fillColor: defaults.fillColor, rounded: defaults.rounded };
        } else if (tool === 'circle') {
            newObj = { id: newId, type: 'circle', strokeColor: sc, strokeWidth: strokeW, x: xPct, y: yPct, width: 0, height: 0, fillColor: defaults.fillColor };
        } else if (tool === 'text') {
            newObj = { id: newId, type: 'text', strokeColor: sc, strokeWidth: strokeW, x: xPct, y: yPct, width: 0.15, height: 0.06, text: '', fontFamily: defaults.fontFamily, fontSize: defaults.fontSize, fontColor: defaults.fontColor, fillColor: defaults.fillColor, fontBold: defaults.fontBold, fontItalic: defaults.fontItalic, fontUnderline: defaults.fontUnderline };
            drawingRef.current = false;
            openInlineTextEditor(newId, newObj, x, y);
            completeDrawing();
            return;
        } else if (tool === 'balloon') {
            newObj = { id: newId, type: 'balloon', strokeColor: sc, strokeWidth: strokeW, x: xPct, y: yPct, width: 0.12, height: 0.08, text: '', fontFamily: defaults.fontFamily, fontSize: defaults.fontSize, fontColor: defaults.fontColor, fillColor: defaults.fillColor, tailDirection: 'down', fontBold: defaults.fontBold, fontItalic: defaults.fontItalic, fontUnderline: defaults.fontUnderline };
            drawingRef.current = false;
            openInlineTextEditor(newId, newObj, x, y);
            completeDrawing();
            return;
        } else if (tool === 'step') {
            const maxStep = currentItems.reduce((m, it) => it.object.type === 'step' ? Math.max(m, it.object.stepNumber) : m, 0);
            const stepFill = defaults.fillColor === 'transparent' ? 'blue' as const : defaults.fillColor;
            newObj = { id: newId, type: 'step', strokeColor: sc, strokeWidth: strokeW, x: xPct, y: yPct, radius: 0.02, stepNumber: maxStep + 1, fillColor: stepFill, fontColor: defaults.fontColor };
            drawingRef.current = false;
            const stepItem: DrawItem = { id: newId, object: newObj, showAtMs: currentDrawShowAt, hideAtMs: currentDrawHideAt, transition: currentDrawTransition, groupId: currentDrawGroupId, xPct, yPct, wPct: 0.04, hPct: 0.04 };
            onItemsChange([...currentItems, stepItem]);
            onSelectItem(newId);
            completeDrawing();
            return;
        } else if (tool === 'highlighter') {
            newObj = { id: newId, type: 'highlighter', strokeColor: sc, strokeWidth: strokeW, points: [{ x: xPct, y: yPct }] };
        } else if (tool === 'callout') {
            const maxCallout = currentItems.reduce((m, it) => (it.object.type === 'callout' || it.object.type === 'step') ? Math.max(m, (it.object as { stepNumber: number }).stepNumber) : m, 0);
            const calloutFill = defaults.fillColor === 'transparent' ? 'blue' as const : defaults.fillColor;
            newObj = { id: newId, type: 'callout', strokeColor: sc, strokeWidth: strokeW, x1: xPct, y1: yPct, x2: xPct, y2: yPct, stepNumber: maxCallout + 1, fillColor: calloutFill, fontColor: defaults.fontColor, radius: 0.06 };
        } else if (tool === 'dimension') {
            newObj = { id: newId, type: 'dimension', strokeColor: sc, strokeWidth: strokeW, x1: xPct, y1: yPct, x2: xPct, y2: yPct };
        } else if (tool === 'curvedArrow') {
            newObj = { id: newId, type: 'curvedArrow', strokeColor: sc, strokeWidth: strokeW, x1: xPct, y1: yPct, x2: xPct, y2: yPct, cpx: xPct, cpy: yPct };
        } else {
            return;
        }

        const newItem: DrawItem = { id: newId, object: newObj, showAtMs: currentDrawShowAt, hideAtMs: currentDrawHideAt, transition: currentDrawTransition, groupId: currentDrawGroupId, xPct, yPct, wPct: 0, hPct: 0 };
        currentObjRef.current = newItem;
        onItemsChange([...currentItems, newItem]);
        onSelectItem(newId);
    }, [isEditing, defaults, currentDrawShowAt, currentDrawHideAt, currentDrawTransition, currentDrawGroupId, svgPxToPct, eventToSvgPx, onItemsChange, onSelectItem, openInlineTextEditor, completeDrawing, itemObjectToScaled]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isEditing) return;
        const pos = eventToSvgPx(e);
        if (!pos) return;
        const b = boundsRef.current;
        if (!b) return;
        const { x, y } = pos;
        const currentItems = itemsRef.current;

        if (rotateRef.current) {
            const { itemId, centerPx, startAngle, origRotation } = rotateRef.current;
            const currentAngle = Math.atan2(y - centerPx.cy, x - centerPx.cx) * (180 / Math.PI);
            let delta = currentAngle - startAngle;
            if (e.shiftKey) delta = Math.round(delta / 15) * 15;
            const newRotation = origRotation + delta;
            onItemsChange(currentItems.map((it) => it.id === itemId ? { ...it, rotation: newRotation } : it));
            return;
        }

        if (resizeRef.current) {
            const { itemId, handle, startPx, origItem } = resizeRef.current;
            const dx = x - startPx.x;
            const dy = y - startPx.y;
            const updated = applyResize(origItem, handle, dx / b.w, dy / b.h);
            onItemsChange(currentItems.map((it) => it.id === itemId ? updated : it));
            return;
        }

        if (dragRef.current) {
            const { itemId, startPx, origItem } = dragRef.current;
            const updated = applyDrag(origItem, (x - startPx.x) / b.w, (y - startPx.y) / b.h);
            onItemsChange(currentItems.map((it) => it.id === itemId ? updated : it));
            return;
        }

        if (!drawingRef.current || !currentObjRef.current) return;
        const { x: sx2, y: sy2 } = startPctRef.current;
        const { xPct, yPct } = svgPxToPct(x, y);
        const item = currentObjRef.current;

        let updatedItem: DrawItem;
        if (item.object.type === 'freehand') {
            const pts = [...(item.object as { points: DrawPoint[] }).points, { x: xPct, y: yPct }];
            updatedItem = { ...item, object: { ...item.object, points: pts }, wPct: null, hPct: null };
        } else if (item.object.type === 'highlighter') {
            const pts = [...(item.object as { points: DrawPoint[] }).points, { x: xPct, y: yPct }];
            updatedItem = { ...item, object: { ...item.object, points: pts }, wPct: null, hPct: null };
        } else if (item.object.type === 'arrow' || item.object.type === 'line' || item.object.type === 'dimension') {
            updatedItem = { ...item, object: { ...item.object, x2: xPct, y2: yPct }, wPct: xPct - sx2, hPct: yPct - sy2 };
        } else if (item.object.type === 'callout') {
            updatedItem = { ...item, object: { ...item.object, x2: xPct, y2: yPct } };
        } else if (item.object.type === 'curvedArrow') {
            const midX = (sx2 + xPct) / 2;
            const midY = (sy2 + yPct) / 2;
            const dx2 = xPct - sx2;
            const dy2 = yPct - sy2;
            const cpx2 = midX - dy2 * 0.3;
            const cpy2 = midY + dx2 * 0.3;
            updatedItem = { ...item, object: { ...item.object, x2: xPct, y2: yPct, cpx: cpx2, cpy: cpy2 }, wPct: xPct - sx2, hPct: yPct - sy2 };
        } else if (item.object.type === 'rect' || item.object.type === 'circle' || item.object.type === 'text' || item.object.type === 'balloon') {
            const minX = Math.min(sx2, xPct);
            const minY = Math.min(sy2, yPct);
            const w = Math.abs(xPct - sx2);
            const h = Math.abs(yPct - sy2);
            updatedItem = { ...item, xPct: minX, yPct: minY, object: { ...item.object, x: minX, y: minY, width: w, height: h } as DrawObject, wPct: w, hPct: h };
        } else {
            updatedItem = item;
        }
        currentObjRef.current = updatedItem;
        onItemsChange(currentItems.map((it) => it.id === item.id ? updatedItem : it));
    }, [isEditing, svgPxToPct, eventToSvgPx, onItemsChange]);

    const onMouseUp = useCallback(() => {
        if (!isEditing) return;
        const wasDrawing = drawingRef.current;
        const drawnItemId = currentObjRef.current?.id ?? null;
        const hadInteraction = wasDrawing || dragRef.current !== null || resizeRef.current !== null || rotateRef.current !== null;
        drawingRef.current = false;
        currentObjRef.current = null;
        dragRef.current = null;
        resizeRef.current = null;
        rotateRef.current = null;
        if (hadInteraction) onItemsCommit();
        if (wasDrawing) {
            if (drawnItemId) onSelectItem(drawnItemId);
            completeDrawing();
        }
    }, [isEditing, onItemsCommit, completeDrawing, onSelectItem]);

    const cursor = isEditing ? (activeToolRef.current === 'select' ? 'default' : 'crosshair') : 'default';

    return (
        <svg
            ref={svgRef}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'visible',
                pointerEvents: isEditing ? 'all' : 'none',
                cursor,
                userSelect: 'none',
                zIndex: 10,
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onDoubleClick={onDoubleClick}
        />
    );
});

export default CanvasDrawOverlay;
