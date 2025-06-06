export interface TruckModel {
  id: string;
  make: string;
  model: string;
  years: number[];
  engines: string[];
  commonIssues: string[];
}

export const TRUCK_MODELS: TruckModel[] = [
  {
    id: 'peterbilt-379',
    make: 'Peterbilt',
    model: '379',
    years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007],
    engines: ['Caterpillar C15', 'Cummins ISX', 'Detroit Diesel Series 60'],
    commonIssues: ['DPF regeneration problems', 'Turbocharger issues', 'Air brake system leaks']
  },
  {
    id: 'kenworth-t680',
    make: 'Kenworth',
    model: 'T680',
    years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    engines: ['PACCAR MX-13', 'Cummins ISX15', 'Cummins X15'],
    commonIssues: ['DEF system problems', 'Transmission shifting issues', 'Electrical problems']
  },
  {
    id: 'freightliner-cascadia',
    make: 'Freightliner',
    model: 'Cascadia',
    years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    engines: ['Detroit DD13', 'Detroit DD15', 'Cummins ISX15'],
    commonIssues: ['Aftertreatment system failures', 'EGR valve problems', 'SCR catalyst issues']
  },
  {
    id: 'volvo-vnl',
    make: 'Volvo',
    model: 'VNL',
    years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    engines: ['Volvo D11', 'Volvo D13', 'Volvo D16'],
    commonIssues: ['DPF system malfunctions', 'Cooling system leaks', 'I-Shift transmission problems']
  },
  {
    id: 'mack-anthem',
    make: 'Mack',
    model: 'Anthem',
    years: [2018, 2019, 2020, 2021, 2022, 2023],
    engines: ['Mack MP7', 'Mack MP8'],
    commonIssues: ['mDRIVE transmission issues', 'Emissions system failures', 'Fuel system problems']
  },
  {
    id: 'international-lonestar',
    make: 'International',
    model: 'LoneStar',
    years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
    engines: ['Cummins ISX', 'MaxxForce 13', 'MaxxForce 15'],
    commonIssues: ['EGR system failures', 'Turbocharger problems', 'Fuel injection issues']
  }
];

export const getModelsByMake = (make: string): TruckModel[] => {
  return TRUCK_MODELS.filter(truck => truck.make.toLowerCase() === make.toLowerCase());
};

export const getTruckById = (id: string): TruckModel | undefined => {
  return TRUCK_MODELS.find(truck => truck.id === id);
};

export const getAllMakes = (): string[] => {
  const makes = TRUCK_MODELS.map(truck => truck.make);
  return [...new Set(makes)].sort();
};
