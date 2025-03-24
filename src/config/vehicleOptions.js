export const vehicleOptions = {
    bmw: {
      name: 'BMW',
      models: {
        '1 Series': ['128i', '135i', 'M135i'],
        '2 Series': ['230i', 'M240i', 'M2 Competition'],
        '3 Series': ['320i', '330i', 'M340i', 'M3'],
        '4 Series': ['430i', 'M440i', 'M4'],
        '5 Series': ['530i', '540i', 'M550i', 'M5'],
        '7 Series': ['740i', '750i', 'M760i'],
        'X3': ['sDrive30i', 'xDrive30i', 'M40i', 'X3 M'],
        'X5': ['sDrive40i', 'xDrive40i', 'M50i', 'X5 M'],
        'Z4': ['sDrive30i', 'M40i'],
        'i4': ['eDrive40', 'M50'],
        'iX': ['xDrive50', 'M60']
      }
    },
    mercedes: {
      name: 'Mercedes-Benz',
      models: {
        'A-Class': ['A220', 'AMG A35'],
        'C-Class': ['C300', 'AMG C43', 'AMG C63'],
        'E-Class': ['E350', 'E450', 'AMG E53', 'AMG E63'],
        'S-Class': ['S500', 'S580', 'AMG S63'],
        'GLA': ['GLA 250', 'AMG GLA 35'],
        'GLC': ['GLC 300', 'AMG GLC 43'],
        'GLE': ['GLE 350', 'AMG GLE 63'],
        'EQS': ['EQS 450+', 'EQS 580', 'AMG EQS']
      }
    },
    audi: {
      name: 'Audi',
      models: {
        'A3': ['Premium', 'Premium Plus', 'Prestige'],
        'A4': ['Premium', 'Premium Plus', 'Prestige'],
        'Q5': ['Premium', 'Premium Plus', 'Prestige', 'SQ5'],
        'RS5': ['Sportback', 'Coupe'],
        'e-tron': ['Premium', 'Premium Plus', 'Prestige']
      }
    },
    honda: {
      name: 'Honda',
      models: {
        'Civic': ['LX', 'Sport', 'EX', 'Si', 'Type R'],
        'Accord': ['LX', 'Sport', 'EX-L', 'Touring'],
        'CR-V': ['LX', 'EX', 'EX-L', 'Touring']
      }
    },
    toyota: {
      name: 'Toyota',
      models: {
        'Camry': ['LE', 'SE', 'XSE', 'XLE', 'TRD'],
        'Corolla': ['L', 'LE', 'SE', 'XSE'],
        'Tacoma': ['SR', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro'],
        'Tundra': ['SR5', 'Limited', 'Platinum', '1794 Edition', 'TRD Pro']
      }
    },
    gmc: {
      name: 'GMC',
      models: {
        'Sierra': ['1500', '2500HD', '3500HD'],
        'Yukon': ['XLT', 'AT4', 'Denali'],
        'Acadia': ['Base', 'SLE', 'SLT', 'Avenir'],
        'Terrain': ['S', 'SV', 'SL', 'AT4'],
        'Canyon': ['SLE', 'AT4', 'Denali']
      }
    },
    ford: {
      name: 'Ford',
      models: {
        'F-150': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor'],
        'Mustang': ['EcoBoost', 'GT', 'Mach 1', 'Shelby GT500'],
        'Bronco': ['Base', 'Big Bend', 'Black Diamond', 'Wildtrak', 'Raptor']
      }
    },
    chevrolet: {
      name: 'Chevrolet',
      models: {
        'Silverado': ['WT', 'LT', 'RST', 'LTZ', 'High Country', 'ZR2'],
        'Camaro': ['LS', 'LT', 'SS', 'ZL1'],
        'Corvette': ['Stingray', 'Z06', 'E-Ray']
      }
    },
    tesla: {
      name: 'Tesla',
      models: {
        'Model S': ['Long Range', 'Plaid'],
        'Model 3': ['Standard Range', 'Long Range', 'Performance'],
        'Model X': ['Long Range', 'Plaid'],
        'Model Y': ['Long Range', 'Performance'],
        'Cybertruck': ['Dual Motor', 'Tri Motor'],
        'Roadster': ['Base', "Founder's Edition"]
      }
    },
    nissan: {
      name: 'Nissan',
      models: [
        'Altima', 'Maxima', 'Rogue', 'Murano', 'Pathfinder',
        'Titan', 'Frontier', '370Z', 'GT-R', 'Ariya'
      ]
    },
    volkswagen: {
      name: 'Volkswagen',
      models: [
        'Golf', 'Passat', 'Jetta', 'Tiguan', 'Atlas', 'ID.4'
      ]
    },
    hyundai: {
      name: 'Hyundai',
      models: [
        'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade',
        'Kona', 'Ioniq 5', 'Ioniq 6'
      ]
    },
    kia: {
      name: 'Kia',
      models: [
        'Forte', 'Optima', 'Sorento', 'Sportage', 'Telluride', 'EV6'
      ]
    },
    subaru: {
      name: 'Subaru',
      models: [
        'Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'WRX', 'BRZ'
      ]
    },
    dodge: {
      name: 'Dodge',
      models: [
        'Challenger', 'Charger', 'Durango', 'Journey'
      ]
    },
    jeep: {
      name: 'Jeep',
      models: {
        'Wrangler': ['Sport', 'Sahara', 'Rubicon', '4xe'],
        'Grand Cherokee': ['Laredo', 'Limited', 'Overland', 'Summit', 'Trackhawk']
      }
    },
    land_rover: {
      name: 'Land Rover',
      models: [
        'Range Rover', 'Defender', 'Discovery', 'Evoque'
      ]
    },
    porsche: {
      name: 'Porsche',
      models: {
        '911': ['Carrera', 'Turbo', 'GT3', 'GT3 RS'],
        'Cayenne': ['Base', 'S', 'Turbo', 'GTS'],
        'Taycan': ['4S', 'Turbo', 'Turbo S']
      }
    },
    ferrari: {
      name: 'Ferrari',
      models: {
        'Roma': ['Base'],
        'F8': ['Tributo', 'Spider'],
        'SF90': ['Stradale', 'Spider']
      }
    },
    lamborghini: {
      name: 'Lamborghini',
      models: {
        'Huracan': ['EVO', 'STO', 'Tecnica'],
        'Aventador': ['S', 'SVJ'],
        'Urus': ['Base', 'Performante']
      }
    },
    // --- Domestic Manufacturers ---
    cadillac: {
      name: 'Cadillac',
      models: {
        'CT Series': ['CT4', 'CT5', 'CT6'],
        'Escalade': ['Base', 'Luxury', 'Sport', 'Platinum'],
        'XT Series': ['XT4', 'XT5', 'XT6'],
        'SRX Series': ['SRX', 'SRX-4']
      }
    },
    buick: {
      name: 'Buick',
      models: {
        'Encore': ['Standard', 'Avenir'],
        'Enclave': ['Standard', 'Avenir'],
        'Regal': ['Touring', 'GS'],
        'LaCrosse': ['Base', 'Limited']
      }
    },
    lincoln: {
      name: 'Lincoln',
      models: {
        'Navigator': ['Standard', 'Black Label'],
        'Corsair': ['Base', 'Reserve', 'Black Label'],
        'Aviator': ['Standard', 'Reserve', 'Black Label'],
        'MKZ': ['Base', 'Black Label']
      }
    },
    chrysler: {
      name: 'Chrysler',
      models: {
        '300': ['L', 'Limited', '300S', 'SRT']
      }
    }
  };
  
  export const engineOptions = [
    '4-cylinder',
    '6-cylinder',
    '8-cylinder',
    'electric',
    'hybrid',
    '12-cylinder'
  ];
  
  export const colorOptions = [
    'black', 'white', 'silver', 'gray', 'red',
    'blue', 'green', 'yellow', 'brown', 'gold',
    'orange', 'purple', 'pink', 'matte black', 'custom colors'
  ];
  