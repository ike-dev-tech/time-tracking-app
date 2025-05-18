import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CategoryWithDuration } from "@shared/schema";
import { getContrastColor } from "@/lib/colors";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivitySummaryProps {
  summary: CategoryWithDuration[];
}

export default function ActivitySummary({ summary }: ActivitySummaryProps) {
  const chartRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || !summary.length) return;
    
    // Clear previous content
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Setup
    const width = 160;
    const height = 160;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
      
    // Prepare data
    const filteredSummary = summary.filter(s => s.hours > 0);
    
    // Generate pie
    const pie = d3.pie<CategoryWithDuration>()
      .value(d => d.hours)
      .sort(null);
      
    const data = pie(filteredSummary);
    
    // Generate arc
    const arc = d3.arc<d3.PieArcDatum<CategoryWithDuration>>()
      .innerRadius(radius * 0.5) // Donut chart
      .outerRadius(radius);
      
    // Draw chart
    svg.selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("opacity", 0.85)
      .append("title")
      .text(d => `${d.data.name}: ${d.data.hours}時間 (${d.data.percentage}%)`);
      
    // Add center text
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("dy", "0.35em")
      .text("24時間");
      
  }, [summary]);

  if (!summary.length) {
    return (
      <div className="flex flex-col items-center">
        <Skeleton className="w-40 h-40 rounded-full" />
        <div className="space-y-3 w-full mt-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center mb-6">
        <svg ref={chartRef} className="w-40 h-40 rounded-full" />
      </div>
      
      <div className="space-y-3">
        {summary
          .filter(item => item.hours > 0)
          .sort((a, b) => b.hours - a.hours)
          .map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{item.hours}時間</span>
                <span className="text-gray-500 dark:text-gray-400">{item.percentage}%</span>
              </div>
            </div>
          ))}
          
        {summary.every(item => item.hours === 0) && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            まだアクティビティがありません
          </div>
        )}
      </div>
    </div>
  );
}
