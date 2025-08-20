
const container = document.querySelector("#root");
const tooltip = document.createElement("div");
tooltip.setAttribute("id", "tooltip");
tooltip.setAttribute("class", "frame");
document.body.appendChild(tooltip);

const urlData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const urlCountry = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

async function getData(dataBase) {
    try {
        const response = await fetch(dataBase);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error type:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        return null;
    }
}

function format(d) {
    return `${d}%`;
}

function createChoroplethMap(data, infoCountry) {
    const color = d3.scaleQuantize(d3.extent(data.map(d => d.bachelorsOrHigher)), d3.schemeReds[9]);
    const path = d3.geoPath();

    const valuemap = new Map(data.map(d => [d.fips, d.bachelorsOrHigher]));
    const valuemap1 = new Map(data.map(d => [d.fips, d.area_name]));
    const valuemap2 = new Map(data.map(d => [d.fips, d.state]));

    const counties = topojson.feature(infoCountry, infoCountry.objects.counties);
    const states = topojson.feature(infoCountry, infoCountry.objects.states);
    const statemap = new Map(states.features.map(d => [d.id, d]));
    const statemesh = topojson.mesh(infoCountry, infoCountry.objects.states, (a, b) => a !== b);

    const svg = d3.create("svg")
        .attr("width", 1000)
        .attr("height", 600)
        .attr("viewBox", [0, 0, 1000, 600])
        .attr("style", "max-width: 100%; height: auto;");

    svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(610,20)")
        .append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
        .attr("x", (d, i) => i * (240 / color.range().length))
        .attr("y", 0)
        .attr("width", 240 / color.range().length)
        .attr("height", 20)
        .attr("fill", d => d);
    svg.append("g")
        .attr("transform", "translate(610,0)")
        .append("text")
        .attr("x", 0)
        .attr("y", 15)
        .style("font-size", "16px")
        .style("text-anchor", "start")
        .text("Bachelor's degree or higher (%)");
    svg.append("g")
        .attr("transform", "translate(610,40)")
        .append("text")
        .attr("x", 0)
        .attr("y", 15)
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text(`${d3.extent(data.map(d => d.bachelorsOrHigher))[0]}`);
    svg.append("g")
        .attr("transform", "translate(610,40)")
        .append("text")
        .attr("x", 240)
        .attr("y", 15)
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text(`${d3.extent(data.map(d => d.bachelorsOrHigher))[1]}`);

    svg.append("g")
        .selectAll("path")
        .data(counties.features)
        .join("path")
        .attr("class", "county")
        .attr("data-fips", d => `${d.id}`)
        .attr("data-education", d => `${valuemap.get(d.id)}`)
        .attr("fill", d => color(valuemap.get(d.id)))
        .attr("d", path)
        .on("mouseover", (event, d) => {
            const tooltip = document.querySelector("#tooltip");
            tooltip.setAttribute("data-education", `${valuemap.get(d.id)}`)
            tooltip.setAttribute("style", `
                left: ${event.pageX + 12}px;
                top: ${event.pageY - 28}px;
                visibility: visible;
                opacity: 1;
                display: flex;
                flex-flow: column;
                align-items: center;
                justify-content: center;`
            );
            tooltip.innerHTML =
                `<p>${valuemap1.get(d.id)}</p>
                <p>${valuemap2.get(d.id)}</p>
                <p>${valuemap.get(d.id)}%</p>`;
        })
        .on("mouseout", () => {
            const tooltip = document.querySelector("#tooltip");
            tooltip.setAttribute("style", "visibility: hidden; opacity: 0; transition: opacity 1s;");
        });

    svg.append("path")
        .datum(statemesh)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    return svg.node();
}

async function main() {
    const dataset = await getData(urlData);
    const country = await getData(urlCountry);
    const svg = createChoroplethMap(dataset, country);
    container.appendChild(svg);
}

main();
