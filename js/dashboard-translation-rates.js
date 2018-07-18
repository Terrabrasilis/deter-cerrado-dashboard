var Translation={
	'pt-br':{
		/* texts into HTML entities */
		'txt1':'Incrementos de desmatamento',
		'txt1a':'',
		'txt1c':'Informações de ajuda para uso do painel',
		'txt1d':'Veja o vídeo introdutório que mostra a interação de um usuário com as ferramentas do painel.',
		'txt1e':'Fechar',
		'txt1f':'Pesquisa de municípios',
		'txt1g':'Encontre um município.',
		'txt1h':'Selecione um item na lista de municípios encontrados.',
		'txt1i':'Fechar',
		'txt2':'',
		'txt2a':'Informações gerais',
		'txt2b':'<h3>Sobreposição PRODES Amazônia x Cerrado</h3>'+
		'<br /><br />'+
		'O Mapeamento do cerrado é realizado para toda extensão do Bioma, o que inclui uma zona de sobreposição com os limites da Amazônia Legal Brasileira. Ocorre que as áreas de florestas, dentro da zona de sobreposição entre os limites do Bioma Cerrado e os limites da Amazônia Legal, 7% da área total, já são mapeadas, desde 1988, pelo projeto PRODES Amazônia. Nesta área de sobreposição o INPE utilizou os dados  já mapeados pelo PRODES Amazônia, para evitar resultados discrepantes entre os dois produtos. Apesar dos dois mapeamentos possuírem a mesma legenda (i.e. desmatamento do tipo corte raso) existe uma peculiaridade em relação ao início de suas séries históricas e frequências de mapeamento.'+
		'<br /><br />'+
		'O PRODES Cerrado tem uma série histórica com início no ano 2000 e possui frequência de mapeamento bianual até 2012 e anual desde 2013 até 2017. O PRODES Amazônia tem sua série histórica com início em 1988 e possui frequência anual de mapeamento, entretanto durante esse período foi necessário fazer um ajuste geométrico na máscara de desmatamento para corrigir deslocamentos causados por diferentes processos de georreferenciamento das imagens adotados ao longo da vida do projeto. <a href="http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/nt_deslocamentomascara.pdf" target="_blank">Acesse este link para mais detalhes.</a>'+
		'<br /><br />'+
		'Este ajuste na máscara de desmatamento do PRODES Amazônia resultou em uma agregação de todos os anos mapeados até 2008 em um único plano de informação, não sendo possível separar a geometria do desmatamento dos anos anteriores. Uma vez que os números computados pelo PRODES Cerrado são referentes ao desmatamento mapeado a partir da máscara agregada do ano 2000, início de sua série histórica, os mesmos não consideram a área de desmatamento acumulado até o ano 2000.'+
		'<br /><br />'+
		'Por essa razão, ainda que esta diferença ocorra apenas na área de sobreposição (7% da área total), os números do desmatamento anual publicados no dashboard do TerraBrasilis (www.dpi.inpe.br/fipcerrado/dashboard/) não são iguais aos dados geográficos disponibilizados para download no mesmo site, exclusivamente para os anos 2000 até 2008.',
		'txt2c':'Fechar',
		'txt3':'Baixar Dados',
		'txt4':'Imprimir',
		'txt5':'Escuro/Claro',
		'txt6':'Entrar',
		'txt7':'Incrementos anuais de desmatamento no Cerrado Brasileiro',
		'txt8':'Filtro:',
		'txt9':'Limpar este filtro.',
		'txt10':'Baixar a imagem do gráfico de barras em formato PNG.',
		'txt11':'Filtro:',
		'txt12':'Limpar este filtro.',
		'txt13':'Baixar a imagem do gráfico de séries em formato PNG.',
		'txt14':'Baixar a imagem do gráfico de pizza em formato PNG.',
		'txt15':'Tabelas dos incrementos de desmatamento anuais e variações relativas no Cerrado Brasileiro',
		'txt16':'Incremento anual de desmatamento entre <span id="year-range"></span> (km²/ano)',
		'txt17':'Baixar CSV',
		'txt18':'Variações relativas dos incrementos anuais de desmatamento (%)',
		'txt19':'Informações complementares',
		'txt20':'Para os biênios 2001-2002, 2003-2004, 2005-2006, 2007-2008, 2009-2010 e 2011-2012, foi feito um mapeamento, e atribuiu-se a cada um dos anos a metade do incremento do respectivo biênio.',
		/*'txt21':'Para consultar a área de interesse MATOPIBA, utilize o filtro no menu Ferramentas, no topo da página',*/
		/*'txt22':'2004 - início do',*/
		'txt23':'Mais informações sobre o projeto FIP Cerrado',
		'txt24':'Fechar',
		'txt25':'Informações para download',
		'txt26':'Baixar uma tabela com os incrementos de desmatamento em formato CSV.',
		'txt27':'Incluindo os filtros aplicados.',
		'txt28':'Não incluindo os filtros aplicados.',
		'txt29':'Fechar',
		'txt30':'A impressão deste documento utiliza os recursos do navegador e pode apresentar diferenças entre eles.<br />'+
		'A impressão acomoda bem os gráficos quando as configurações de página são as seguintes:<br />'+
		'&nbsp;&nbsp;&nbsp;- A orientação do papel é do tipo paisagem;<br />'+
		'&nbsp;&nbsp;&nbsp;- O tamanho de papel é A4;<br />'+
		'&nbsp;&nbsp;&nbsp;- E margens padrão do navegador.<br />',
		'txt31':'Imprimir',
		'txt32':'<strong>Nota:</strong> Clique no texto para expandir/recolher os painéis.',
		'txt33':'Procurar um município.',
		'txt34':'Filtro:',
		'txt35':'Limpar este filtro.',
		'txt36':'Baixar a imagem do gráfico em formato PNG.',
		/* titles for HTML entities */
		'title-chart-bar-by-year-625':'Totais anuais',
		'title-chart-by-state':'Totais por Estado',
		'title-chart-states':'Totais anuais por Estado',
		'title-chart-by-mun':'Desmatamento por Município',
		'about-close':'Fechar',
		'downloadBtn':'Baixar a tabela de incrementos de desmatamento em formato CSV.',
		'prepare_print':'Imprimir esta página utilizando o recurso do navegador.',
		'change_style':'Alternar o estilo de apresentação escuro/claro.',
		'display_warning':'Clique para ver mais informações sobre os incrementos.',
		'downloadTableBtn':'Baixar a tabela de incrementos de desmatamento em formato CSV.',
		'print_page':'Imprimir esta página utilizando o recurso do navegador.',
		/* Texts inside javascript. */
		'cumulate':'Acumulado:',
		'footer1':'Gerado por INPE/OBT/DPI/TerraBrasilis em',
		'footer2':'sob licença <a target="blank_" href="https://creativecommons.org/licenses/by-sa/4.0/deed.pt_BR">CC BY-SA 4.0</a>',
		'barYAxis':'Área em km²/ano',
		'barXAxis':'Período de monitoramento no Cerrado Brasileiro: ',
		'area':'Área: ',
		'state':'Estado: ',
		'county':'Município',
		'year':'Ano: ',
		'percent':'Porcentagem: ',
		'filter':'Filtro',
		'with_filter':'acima de 6,25ha',
		'without_filter':'acima de 1ha',
		'lineYAxis':'Área em km²/ano',
		'lineXAxis':'Período de monitoramento no Cerrado Brasileiro: ',
		'tableYearState':'Ano / Estado',
		'failure_load_data':'Falhou ao carregar os dados. ',
		'refresh_data':'Repetir a carga dos dados.',
		'no_data':'Sem dados para exibir. ',
		'no_value':'Sem valor',
		'not_found':'Não encontrou item para esta pesquisa.',
		'tools': 'Ferramentas <span class="caret"></span>',
		'help' : 'Ajuda <span class="caret"></span>',
		'video': 'Video Introdutório',
		'about': 'Sobre',
		'contactus': 'Contato',
		'tt-contactus': 'Envie-nos um e-mail com sugestões e dúvidas sobre o projeto PRODES (prodes@dpi.inpe.br)'
	},
	'en':{
		/* texts into HTML entities */
		'txt1':'Deforestation increments',
		'txt1a':'Map',
		'txt1c':'Useful information to manage the dashboard.',
		'txt1d':'Watch the introductory video to see how an user interact with dashboard tools.',
		'txt1e':'Close',
		'txt1f':'Search for municipalities',
		'txt1g':'Find a county.',
		'txt1h':'Select an item from the list of found municipalities.',
		'txt1i':'Close',
		'txt2':'Deforestation increments',
		'txt2a':'General informations',
		'txt2b':'<h3>Overlay PRODES Amazon x Closed</h3>'+
		'<br /><br />'+
		'Mapping of the cerrado is carried out for the whole extension of the Biome, which includes an overlap zone with the limits of the Brazilian Legal Amazon. It occurs that the forest areas, within the zone of overlap between the borders of the Cerrado Biome and the limits of the Legal Amazon, 7% of the total area, have been mapped since 1988 by PRODES Amazônia. In this area of ​​overlap, INPE used the data already mapped by PRODES Amazônia, to avoid discrepant results between the two products. Although the two mappings have the same legend (i.e. shallow-cut deforestation) there is a peculiarity in relation to the beginning of their historical series and mapping frequencies.'+
		'<br /><br />'+
		'PRODES Cerrado has a historical series beginning in the year 2000 and has bi-annual mapping frequency until 2012 and annual from 2013 to 2017. PRODES Amazônia has its historical series beginning in 1988 and has an annual mapping frequency, however during that period it was it is necessary to make a geometric adjustment in the deforestation mask to correct displacements caused by different processes of georeferencing of the images adopted throughout the life of the project.  <a href="http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/nt_deslocamentomascara.pdf" target="_blank">Access this link for more details.</a>'+
		'<br /><br />'+
		'This adjustment in the deforestation mask of PRODES Amazônia resulted in an aggregation of all the years mapped until 2008 into a single information plan, and it is not possible to separate the geometry of deforestation from previous years. Since the numbers computed by PRODES Cerrado refer to the deforestation mapped from the aggregate mask of the year 2000, beginning of its historical series, they do not consider the deforestation area accumulated until the year 2000.'+
		'<br /><br />'+
		'For this reason, even though this difference occurs only in the overlapping area (7% of the total area), the annual deforestation figures published in the TerraBrasilis dashboard (www.dpi.inpe.br/fipcerrado/dashboard/) are not the same as the geographic data available for download at the same site, exclusively for the years 2000 to 2008.',
		'txt2c':'Close',
		'txt3':'Download',
		'txt4':'Print',
		'txt5':'Dark/Light',
		'txt6':'Login',
		'txt7':'Annual deforestation increments in Brazilian Cerrado',
		'txt8':'Filter:',
		'txt9':'Clean this filter.',
		'txt10':'Download the bar chart image in a PNG format.',
		'txt11':'Filter:',
		'txt12':'Clean this filter.',
		'txt13':'Download the series chart image in a PNG format.',
		'txt14':'Download the pie chart image in a PNG format.',
		'txt15':'Tables of the annual deforestation increments and relative variation in Brazilian Cerrado',
		'txt16':'Annual deforestation increments between <span id="year-range"></span> (km²/year)',
		'txt17':'Download CSV',
		'txt18':'Relative variations of the annual deforestation increments (%)',
		'txt19':'Additional information',
		'txt20':'For the biennia 2001-2002, 2003-2004, 2005-2006, 2007-2008, 2009-2010 and 2011-2012, a mapping was done, and each half of the biennium increase was attributed to each year.',
		/*'txt21':'1993 and 1994 deforestation increments correspond to the <strong>mean of the deforestation increments found between these years. </ Strong>',*/
		/*'txt22':'2004 - start of',*/
		'txt23':'For more information, see FIP Cerrado project',
		'txt24':'Close',
		'txt25':'Download information',
		'txt26':'Download a deforestation increment table in CSV format.',
		'txt27':'Include applied filters.',
		'txt28':'Do not include applied filters.',
		'txt29':'Close',
		'txt30':'This print button triggers browser print resources which may differ depending on the browser.<br />'+
		'We strongly suggest you to arrange charts before printing based on the following setup page:<br />'+
		'&nbsp;&nbsp;&nbsp;- Paper orientation: landscape;<br />'+
		'&nbsp;&nbsp;&nbsp;- Paper size: A4;<br />'+
		'&nbsp;&nbsp;&nbsp;- Paper margins: browser default values.<br />',
		'txt31':'Print',
		'txt32':'<strong>Note:</strong> Click on the text to expand/collapse the panels.',
		'txt33':'Procurar um município.',
		'txt34':'Filtro:',
		'txt35':'Limpar este filtro.',
		'txt36':'Baixar a imagem do gráfico em formato PNG.',
		/* titles for HTML entities */
		'title-chart-bar-by-year-625':'Annual totals',
		'title-chart-by-state':'Totals by State',
		'title-chart-states':'Totals annual by State',
		'title-chart-by-mun':'Deforestation by municipality',
		'about-close':'Close',
		'downloadBtn':'Download the deforestation increments table in a CSV format.',
		'prepare_print':'Print this page using browser resources.',
		'change_style':'Custom website style dark/light.',
		'display_warning':'Click to see more information about the increments.',
		'downloadTableBtn':'Download a deforestation increments table in a CSV format.',
		'print_page':'Print this page using browser resources.',
		/* Texts inside javascript. */
		'cumulate':'Accumulated:',
		'footer1':'Generated by INPE/OBT/DPI/TerraBrasilis at',
		'footer2':'under license <a target="blank_" href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>',
		'barYAxis':'Area in km²/year',
		'barXAxis':'Brazilian Cerrado Monitoring Period: ',
		'area':'Area: ',
		'state':'State: ',
		'year':'Year: ',
		'percent':'Percentage: ',
		'filter':'Filter',
		'with_filter':'up to 6,25ha',
		'without_filter':'up to 1ha',
		'lineYAxis':'Area in km²/year',
		'lineXAxis':'Brazilian Cerrado Monitoring Period: ',
		'tableYearState':'Year / State',
		'failure_load_data':'Failure to load data. ',
		'refresh_data':'Try to load data.',
		'no_data':'No data to show. ',
		'no_value':'No value',
		'not_found':'No search data to show',
		'tools': 'Tools <span class="caret"></span>',
		'help' : 'Help <span class="caret"></span>',
		'video': 'Introductory Video',
		'about': 'About',
		'contactus': 'Contact us',
		'tt-contactus': 'Send us an e-mail with suggestions or questions about the PRODES project (prodes@dpi.inpe.br)'
	},
	'es':{		
		/* texts into HTML entities */
		'txt1':'Incrementos de deforestación',
		'txt1a':'',
		'txt1c':'Informações de ajuda para uso do painel',
		'txt1d':'Mire el video introductorio para ver cómo un usuario interactúa con las herramientas del tablero.',
		'txt1e':'Cerrar',
		'txt1f':'Búsqueda de municipios',
		'txt1g':'Encuentre un municipio.',
		'txt1h':'Seleccione un elemento en la lista de municipios encontrados.',
		'txt1i':'Cerrar',
		'txt2':'',
		'txt2a':'Informaciones generales',
		'txt2b':'<h3>Sobreposición PRODES Amazonia x Cerrado</h3>'+
		'<br /><br />'+
		'El Mapeamento del Cerrado es realizado para toda extensión del Bioma, lo que incluye una zona de superposición con los límites de la Amazonia Legal Brasileña. Se observa que las áreas de bosques, dentro de la zona de superposición entre los límites del Bioma Cerrado y los límites de la Amazonía Legal, el 7% del área total, ya son mapeadas desde 1988 por el proyecto PRODES Amazonia. En esta área de superposición el INPE utilizó los datos ya mapeados por el PRODES Amazonia, para evitar resultados discrepantes entre los dos productos. A pesar de que los dos mapeamientos poseen la misma leyenda (de deforestación del tipo corte raso) existe una peculiaridad en relación al inicio de sus series históricas y frecuencias de mapeo.'+
		'<br /><br />'+
		'El PRODES Cerrado tiene una serie histórica con inicio en el año 2000 y tiene frecuencia de mapeo bianual hasta 2012 y anual desde 2013 hasta 2017. El PRODES Amazonia tiene su serie histórica con inicio en 1988 y tiene una frecuencia anual de mapeo, entretanto durante ese período fue es necesario hacer un ajuste geométrico en la máscara de deforestación para corregir desplazamientos causados ​​por diferentes procesos de georreferenciación de las imágenes adoptadas a lo largo de la vida del proyecto. <a href="http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes/pdfs/nt_deslocamentomascara.pdf" target="_blank">Acceda a este enlace para más detalles.</a>'+
		'<br /><br />'+
		'Este ajuste en la máscara de deforestación del PRODES Amazonia resultó en una agregación de todos los años asignados hasta 2008 en un único plan de información, no siendo posible separar la geometría de la deforestación de los años anteriores. Una vez que los números computados por el PRODES Cerrado son referentes a la deforestación mapeada a partir de la máscara agregada del año 2000, inicio de su serie histórica, los mismos no consideran el área de deforestación acumulada hasta el año 2000.'+
		'<br /><br />'+
		'Por esta razón, aunque esta diferencia sólo ocurre en el área de superposición (7% del área total), los números de la deforestación anual publicados en el tablero de TerraBrasilis (www.dpi.inpe.br/fipcerrado/dashboard/) no son iguales a los datos geográficos disponibles para su descarga en el mismo sitio, exclusivamente para los años 2000 hasta 2008.',
		'txt2c':'Cerrar',
		'txt3':'Descargar datos',
		'txt4':'Imprimir',
		'txt5':'Oscuro/Claro',
		'txt6':'Iniciar sesión',
		'txt7':'Incrementos de deforestación anual en lo Cerrado Brasileño',
		'txt8':'Filtro:',
		'txt9':'Quitar filtro.',
		'txt10':'Descargar la imagen del gráfico en formato PNG.',
		'txt11':'Filtro:',
		'txt12':'Quitar filtro.',
		'txt13':'Descargar la imagen del gráfico en formato PNG.',
		'txt14':'Descargar la imagen del gráfico en formato PNG.',
		'txt15':'Tablas de incrementos anuales y variaciones relativas de los incrementos anuales de deforestación en lo Cerrado Brasileño',
		'txt16':'Incrementos anuales de deforestación entre <span id="year-range"></span> (km²/año)',
		'txt17':'Descargar CSV',
		'txt18':'Variaciones relativas de los incrementos anuales de deforestación (%)',
		'txt19':'Informaciones adicionales',
		'txt20':'Para los bienios 2001-2002, 2003-2004, 2005-2006, 2007-2008, 2009-2010 y 2011-2012, se hizo un mapeo, y se atribuyó a cada uno de los años la mitad del incremento del respectivo bienio.',
		/*'txt21':'Los incrementos presentadas para los años 1993 y 1994 representan la <strong> media entre estos años.</strong>',*/
		/*'txt22':'2004 - start of',*/
		'txt23':'Para más información acceda a la página del proyecto FIP Cerrado',
		'txt24':'Cerrar',
		'txt25':'Cómo descargar tus datos',
		'txt26':'Descargar la tabla con los incrementos de deforestación en formato CSV.',
		'txt27':'Incluir los filtros aplicados.',
		'txt28':'No incluir los filtros aplicados.',
		'txt29':'Cerrar',
		'txt30':'La impresión de este documento utiliza las capacidades del navegador y puede presentar diferencias entre ellos.<br />'+
		'La impresión acomoda bien los gráficos cuando:<br />'+
		'&nbsp;&nbsp;&nbsp;- La orientación del papel es paisaje;<br />'+
		'&nbsp;&nbsp;&nbsp;- El tamaño de papel es A4;<br />'+
		'&nbsp;&nbsp;&nbsp;- Y elegir una configuración de margen predefinida por el navegador.<br />',
		'txt31':'Impresión',
		'txt32':'<strong>Nota:</strong> Haga clic en el texto para expandir/contraer los paneles.',
		'txt33':'Buscar un municipio.',
		'txt34':'Filtro:',
		'txt35':'Limpiar este filtro.',
		'txt36':'Descargar la imagen del gráfico en formato PNG.',
		/* titles for HTML entities */
		'title-chart-bar-by-year-625':'Totales anuales',
		'title-chart-by-state':'Totales por Estado',
		'title-chart-states':'Totales anuales por Estado',
		'title-chart-by-mun':'Deforestación por Municipio',
		'about-close':'Cerrar',
		'downloadBtn':'Descargar la tabla de incrementos de deforestación en formato CSV.',
		'prepare_print':'Imprimir esta página utilizando las capacidades del navegador.',
		'change_style':'Cambiar el tema oscuro/claro.',
		'display_warning':'Haga clic para ver más información sobre los incrementos en la deforestación.',
		'downloadTableBtn':'Descargar la tabla de incrementos de deforestación en formato CSV.',
		'print_page':'Imprimir esta página utilizando las capacidades del navegador.',
		/* Texts inside javascript. */
		'cumulate':'Acumulado:',
		'footer1':'Generado por INPE/OBT/DPI/TerraBrasilis en',
		'footer2':'bajo licencia <a target="blank_" href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>',
		'barYAxis':'Area en km²/año',
		'barXAxis':'Período de monitoreo en lo Cerrado Brasileño:',
		'area':'Área: ',
		'state':'Estado: ',
		'year':'Año: ',
		'percent':'Porcentaje: ',
		'filter':'Filtro',
		'with_filter':'por encima de 6,25ha',
		'without_filter':'por encima de 1ha',
		'lineYAxis':'Area en km²/año',
		'lineXAxis':'Período de monitoreo en lo Cerrado Brasileño: ',
		'tableYearState':'Año / Estado',
		'failure_load_data':'Fallo al cargar los datos. ',
		'refresh_data':'Intenta cargar datos.',
		'no_data':'No hay datos para mostrar. ',
		'no_value':'Sin valor',
		'not_found':'No encontró ningún resultado.',
		'tools': 'Herramientas <span class="caret"></span>',
		'help': 'Ayuda <span class="caret"></span>',
		'video': 'Video Introductorio',
		'about': 'Sobre',
		'contactus': 'Contacto',
		'tt-contactus': 'Envíenos un correo electrónico con sus ideas o dudas sobre el project PRODES (prodes@dpi.inpe.br)'
	}

};