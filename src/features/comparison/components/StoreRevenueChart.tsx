import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { DailyRevenuePoint, Store } from "@/features/overview/types";

type SeriesPoint = { date: string; revenue: number };

type StoreSeries = {
  storeId: string;
  storeName: string;
  points: SeriesPoint[];
};

const WIDTH = 760;
const HEIGHT = 340;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 54 };
const COLORS = d3.schemeTableau10.slice(0, 5);

interface Props {
  series: StoreSeries[];
  dates: string[];
}

export default function StoreRevenueChart({ series, dates }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const maxRevenue =
      d3.max(series.flatMap((s) => s.points.map((p) => p.revenue))) ?? 0;

    const x = d3
      .scalePoint<string>()
      .domain(dates)
      .range([MARGIN.left, WIDTH - MARGIN.right])
      .padding(0.5);

    const y = d3
      .scaleLinear()
      .domain([0, maxRevenue])
      .nice()
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => d.slice(5))
          .tickSizeOuter(0),
      );

    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(y).ticks(6));

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "chart-tooltip")
      .style("display", "none")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #d9d9d9")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("border-radius", "6px")
      .style("box-shadow", "0 4px 14px rgba(0,0,0,0.12)")
      .style("pointer-events", "none");

    const line = d3
      .line<SeriesPoint>()
      .x((d) => x(d.date) ?? 0)
      .y((d) => y(d.revenue))
      .curve(d3.curveMonotoneX);

    series.forEach((serie, index) => {
      svg
        .append("path")
        .datum(serie.points)
        .attr("fill", "none")
        .attr("stroke", COLORS[index])
        .attr("stroke-width", 2.5)
        .attr("d", line);

      svg
        .selectAll(`.dot-${serie.storeId}`)
        .data(serie.points)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.date) ?? 0)
        .attr("cy", (d) => y(d.revenue))
        .attr("r", 3.5)
        .attr("fill", COLORS[index])
        .on("mouseover", (event, point) => {
          tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 12}px`)
            .style("top", `${event.pageY - 10}px`)
            .html(
              `<strong>${serie.storeName}</strong><br/><strong>${point.date}</strong><br/>Revenue: €${point.revenue.toFixed(2)}`,
            );
        })
        .on("mouseout", () => tooltip.style("display", "none"));
    });

    const legend = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top - 6})`);

    series.forEach((serie, index) => {
      const group = legend
        .append("g")
        .attr("transform", `translate(${index * 150}, 0)`);
      group
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", COLORS[index]);
      group
        .append("text")
        .attr("x", 18)
        .attr("y", 11)
        .attr("font-size", 12)
        .text(serie.storeName);
    });

    return () => tooltip.remove();
  }, [dates, series]);

  return <svg ref={ref} width={WIDTH} height={HEIGHT} />;
}
