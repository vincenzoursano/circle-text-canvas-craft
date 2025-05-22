
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

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

  // Sample data
  const nodes: Node[] = [
    { id: "center", name: "Attivismo ambientale", value: 65, isCenter: true },
    { id: "1", name: "Fondazione Italia Nostra", value: 40 },
    { id: "2", name: "Antonella Caroli", value: 35 },
    { id: "3", name: "Giulia Maria Crespi", value: 35 },
    { id: "4", name: "Mariarita Signorini", value: 37 },
    { id: "5", name: "Adele Rossi", value: 30 },
    { id: "6", name: "Silvia Croce", value: 33 },
    { id: "7", name: "Lidia Croce", value: 32 },
    { id: "8", name: "Devastazione del patrimonio", value: 38 },
    { id: "9", name: "Tina Merlin", value: 35 },
    { id: "10", name: "Fondazione Roffredo Caetani", value: 40 },
    { id: "11", name: "Ruolo dell'ambientalista", value: 38 },
    { id: "12", name: "Battaglie ambientaliste", value: 39 },
    { id: "13", name: "Antonia Desideri", value: 34 },
    { id: "14", name: "Comitato per la Costiera Amalfitana", value: 38 },
    { id: "15", name: "Alessandra Mottola", value: 35 },
    { id: "16", name: "Scrittura come attivismo", value: 39 },
    { id: "17", name: "Alda Croce", value: 32 },
    { id: "18", name: "Elena Croce", value: 33 },
    { id: "19", name: "Fondazione Europa Nostra", value: 40 },
    { id: "20", name: "Ebe Giacometti", value: 34 },
    { id: "21", name: "Lotta alla cementificazione", value: 38 },
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

    // Create a color scale
    const color = d3.scaleOrdinal()
      .domain(nodes.map(d => d.id))
      .range(d3.schemeSet2);

    // Create a size scale for bubbles
    const size = d3.scaleLinear()
      .domain([0, 100])
      .range([10, Math.min(dimensions.width, dimensions.height) / 4]);

    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(d => size(d.value)))
      .on('tick', ticked);

    // Create node group
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('aria-label', d => `Bubble representing ${d.name}`)
      .call(drag(simulation));

    // Add a circle to each node
    node.append('circle')
      .attr('r', d => size(d.value))
      .attr('fill', d => d.isCenter ? 'white' : '#f44336')
      .attr('stroke', d => d.isCenter ? '#f44336' : 'none')
      .attr('stroke-width', 2);

    // Add a foreignObject to each node for better text handling
    node.append('foreignObject')
      .attr('width', d => size(d.value) * 1.8)
      .attr('height', d => size(d.value) * 1.8)
      .attr('x', d => -size(d.value) * 0.9)
      .attr('y', d => -size(d.value) * 0.9)
      .html(d => `
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: ${d.isCenter ? '#f44336' : 'white'};
          font-weight: ${d.isCenter ? 'bold' : 'normal'};
          font-size: ${d.isCenter ? '1.2em' : '0.9em'};
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
          padding: 5px;
          box-sizing: border-box;
        ">
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

    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  return (
    <div className="bubble-chart-container" style={{ width: '100%', height: '100%' }}>
      <svg 
        ref={svgRef}
        className="bubble-chart"
        width={dimensions.width}
        height={dimensions.height}
        role="img"
        aria-label="Bubble chart visualization showing relationships between concepts"
      >
        <title>Bubble Chart Visualization</title>
        <desc>An interactive bubble chart showing relationships between various concepts with a central theme.</desc>
      </svg>
    </div>
  );
};

export default BubbleChart;
