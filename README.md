# Academic Currents in the Fediverse: A network analysis of scholarly communities on Mastodon 
Interactive network visualizations for mapping the "Mastodon ScholarSphere".

[![GitHub Pages](https://img.shields.io/badge/View%20Live-Visualizations-brightgreen?style=flat-square)](https://mikcil.github.io/mastodon_scholarsphere/)

This repository hosts a suite of interactive network visualizations exploring the connections between academics on the Mastodon platform. Built using [Sigma.js](http://sigmajs.org/) and hosted via GitHub Pages, these visualizations aim to provide insights into the structure and potential dynamics of scholarly communities within the Fediverse.

## Background

In light of recent shifts in the social media landscape, Mastodon has emerged as a significant alternative platform for scholarly communication and community building. Understanding how academic networks form and operate in this decentralized environment is crucial. This project leverages publicly available, self-reported data to map these connections, offering visual tools for exploration and discovery.

## Visualizations Overview

The project currently includes the following network visualizations, accessible via the landing page linked above:

1.  **Following Relationships (Academics):** A network graph showing direct following ties between individual academics identified from voluntary lists. Nodes represent academics, and edges represent a follow relationship.
2.  **Following Relationships (Disciplines):** An aggregated network where nodes represent academic disciplines (based on self-identification). Edges are weighted by the number of following relationships *between* academics belonging to those disciplines.
3.  **Interaction Network (Academics):** A network intended to show interactions (e.g., replies, boosts, favorites) between individual academics. Data collection and analysis for this network are ongoing.
4.  **Interaction Network (Disciplines):** An aggregated network intended to show interaction patterns *between* disciplines. This is also under development.
5.  **Hashtag Co-occurrence Network:** A network where nodes represent hashtags frequently used by academics in the dataset. Edges connect hashtags that appear together in the same posts, indicating thematic proximity or discussion clusters.

**Explore the visualizations here:** [https://mikcil.github.io/mastodon_scholarsphere/](https://mikcil.github.io/mastodon_scholarsphere/)

## Data Source and Limitations

The underlying data for these visualizations is primarily sourced from publicly available, **voluntary sign-up lists** where academics self-identify their Mastodon handles and disciplines.

**Important Limitations:**

*   **Not Exhaustive:** These lists are not comprehensive and only represent a subset of academics on Mastodon.
*   **Self-Reported Data:** Information relies on users accurately reporting their handles and disciplines. Discipline categorization may vary.
*   **Snapshot in Time:** The networks reflect the data available at the time of collection and may not capture the full dynamism of the platform.
*   **Potential Biases:** Voluntary lists may have inherent biases regarding who signs up, potentially over/under-representing certain fields or demographics.

These visualizations should be interpreted as exploratory tools offering partial insights, rather than definitive representations of the entire academic Mastodon landscape.

## Technology Stack

*   **Visualization:** [Sigma.js](http://sigmajs.org/) (JavaScript library for graph drawing)
*   **Frontend:** HTML, CSS, JavaScript
*   **Hosting:** [GitHub Pages](https://pages.github.com/)
*   **Data processing:** [Gephi](https://gephi.org/)

## License

The code and visualizations in this repository is licensed under the [Creative Commons Attribution 4.0 International](LICENSE.md) license.

## Citation

A full paper presenting this data is currently being written.

## Acknowledgements

*   This project relies on data generously shared by academics on public Mastodon lists.
*   Built with the excellent [Sigma.js](http://sigmajs.org/) library.
*   Landing page background image: "From Shin-Bijutsukai, Anonymous, 1902."

## Contact

For questions or collaborations, please contact michele.ciletti@gmail.com .
