
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Node {
  id: string;
  name: string;
  value: number;
  isCenter?: boolean;
}

interface BubbleChartProps {
  width?: number;
  height?: number;
}

const BubbleChart = ({ width = 800, height = 600 }: BubbleChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [truncatedNodes, setTruncatedNodes] = useState<Set<string>>(new Set());

  // Extended sample data with varying text lengths
  const nodes: Node[] = [
    { id: "center", name: "Interactive Data Visualization", value: 65, isCenter: true },
    { id: "1", name: "D3.js", value: 40 },
    { id: "2", name: "SVG Rendering", value: 35 },
    { id: "3", name: "Data Binding", value: 30 },
    { id: "4", name: "Responsive Design", value: 42 },
    { id: "5", name: "Animation", value: 25 },
    { id: "6", name: "User Experience", value: 38 },
    { id: "7", name: "Accessibility", value: 32 },
    { id: "8", name: "This is an example of a much longer text that might need to be truncated when displayed in a smaller circle", value: 45 },
    { id: "9", name: "Performance Optimization", value: 28 },
    { id: "10", name: "Color Theory", value: 22 },
    { id: "11", name: "Visual Hierarchy in Data Visualization can help users understand the relative importance of different data points", value: 40 },
    { id: "12", name: "Interactivity", value: 35 },
    { id: "13", name: "Data Transformation", value: 30 },
    { id: "14", name: "Scalability", value: 28 },
    { id: "15", name: "Sometimes the most effective data visualizations are those that simplify complex information into easy-to-understand visual representations", value: 48 },
  ];

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = Math.min(window.innerWidth - 40, 800);
      const containerHeight = Math.min(window.innerHeight - 40, 600);
      setDimensions({ 
        width: containerWidth, 
        height: containerHeight 
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if text is truncated after rendering
  const checkTextTruncation = () => {
    const newTruncatedNodes = new Set<string>();
    document.querySelectorAll('.node-text').forEach((element) => {
      const textDiv = element as HTMLDivElement;
      if (textDiv.scrollHeight > textDiv.clientHeight || textDiv.scrollWidth > textDiv.clientWidth) {
        const nodeId = textDiv.dataset.nodeId;
        if (nodeId) newTruncatedNodes.add(nodeId);
      }
    });
    setTruncatedNodes(newTruncatedNodes);
  };

  useEffect(() => {
    // Run truncation check after a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkTextTruncation, 100);
    return () => clearTimeout(timeoutId);
  }, [dimensions]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', [0, 0, dimensions.width, dimensions.height])
      .attr('style', 'max-width: 100%; height: auto;')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle');
    
    // Create a container for all elements that will be transformed
    const container = svg.append('g')
      .attr('class', 'zoom-container');

    // Create a color scale with more variety
    const colorScale = d3.scaleOrdinal()
      .domain(nodes.map(d => d.id))
      .range(d3.schemeCategory10);

    // Create a size scale for bubbles
    const size = d3.scaleLinear()
      .domain([0, 100])
      .range([20, Math.min(dimensions.width, dimensions.height) / 5]);

    // Create a force simulation with adjusted forces
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(10))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(d => size(d.value) + 5))
      .on('tick', ticked);

    // Create node group
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('data-node-id', d => d.id)
      .attr('aria-label', d => `Bubble representing ${d.name}`)
      .call(drag(simulation))
      .on('mousemove', (event, d) => {
        setMousePosition({ x: event.pageX, y: event.pageY });
        setHoveredNode(d);
      })
      .on('mouseleave', () => setHoveredNode(null));

    // Add a circle to each node with varied colors
    node.append('circle')
      .attr('r', d => size(d.value))
      .attr('fill', d => d.isCenter ? '#ffffff' : colorScale(d.id))
      .attr('stroke', d => d.isCenter ? '#f44336' : '#ffffff')
      .attr('stroke-width', d => d.isCenter ? 2 : 1)
      .attr('opacity', 0.9);

    // Add a foreignObject to each node for better text handling
    node.append('foreignObject')
      .attr('width', d => size(d.value) * 1.8)
      .attr('height', d => size(d.value) * 1.8)
      .attr('x', d => -size(d.value) * 0.9)
      .attr('y', d => -size(d.value) * 0.9)
      .html(d => `
        <div xmlns="http://www.w3.org/1999/xhtml" 
          class="node-text"
          data-node-id="${d.id}" 
          style="
            width: ${size(d.value) * 1.5}px;
            text-align: center;
            color: ${d.isCenter ? '#333333' : '#ffffff'};
            font-weight: ${d.isCenter ? 'bold' : 'normal'};
            font-size: ${Math.max(10, size(d.value) / 7)}px;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
            hyphens: auto;
            box-sizing: border-box;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            cursor: pointer;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          "
        >
          ${d.name}
        </div>
      `);

    function ticked() {
      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    }

    // Drag functions
    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // Set min and max zoom levels
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    // Initialize zoom and enable it on the SVG
    svg.call(zoom)
      .on('dblclick.zoom', null); // Disable double-click zoom for better usability

    // Add zoom controls
    const zoomControls = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${dimensions.width - 100}, 20)`);

    // Zoom in button
    zoomControls.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#ccc')
      .attr('cursor', 'pointer')
      .on('click', () => {
        svg.transition()
          .duration(300)
          .call(zoom.scaleBy, 1.3);
      });

    zoomControls.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('+')
      .attr('pointer-events', 'none');

    // Zoom out button
    zoomControls.append('rect')
      .attr('x', 40)
      .attr('y', 0)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#ccc')
      .attr('cursor', 'pointer')
      .on('click', () => {
        svg.transition()
          .duration(300)
          .call(zoom.scaleBy, 0.7);
      });

    zoomControls.append('text')
      .attr('x', 55)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('-')
      .attr('pointer-events', 'none');

    // Reset zoom button
    zoomControls.append('rect')
      .attr('x', 20)
      .attr('y', 40)
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#ccc')
      .attr('cursor', 'pointer')
      .on('click', () => {
        svg.transition()
          .duration(300)
          .call(zoom.transform, d3.zoomIdentity);
      });

    zoomControls.append('text')
      .attr('x', 35)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '10px')
      .text('Reset')
      .attr('pointer-events', 'none');

    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  return (
    <TooltipProvider>
      <div className="bubble-chart-container" style={{ width: '100%', height: '100%' }}>
        <svg 
          ref={svgRef}
          className="bubble-chart"
          width={dimensions.width}
          height={dimensions.height}
          role="img"
          aria-label="Bubble chart visualization showing text within circles"
          onMouseMove={(e) => setMousePosition({ x: e.pageX, y: e.pageY })}
        >
          <title>Bubble Chart Visualization</title>
          <desc>An interactive bubble chart showing various concepts represented as circles with text. Hover over truncated text to see the full content.</desc>
        </svg>
        
        {hoveredNode && truncatedNodes.has(hoveredNode.id) && (
          <div 
            className="absolute bg-black/90 text-white p-2 rounded-md text-sm max-w-[250px] shadow-lg"
            style={{ 
              left: `${mousePosition.x + 15}px`, 
              top: `${mousePosition.y + 15}px`,
              pointerEvents: 'none',
              zIndex: 50
            }}
          >
            {hoveredNode.name}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default BubbleChart;
