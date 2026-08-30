using {InventoryService} from '../srv/inventory-service';


annotate InventoryService.Assets with @(
    UI.SelectionFields         : [
        category_code,
        availabilityStatus_code,
        repairStatus_code
    ],
    UI.LineItem                : [
        {Value: inventoryNumber},
        {Value: name},
        {
            Value: categoryName,
            Label: 'Category'
        },
        {
            Value                    : availabilityStatusName,
            Label                    : 'Availability',
            Criticality              : availabilityStatus.criticality,
            CriticalityRepresentation: #WithIcon
        },
        {
            Value                    : repairStatusName,
            Label                    : 'Repair Status',
            Criticality              : repairStatus.criticality,
            CriticalityRepresentation: #WithIcon
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : assignedToLastName,
            Label : 'Assigned to',
            Target: 'assignedTo'
        },
        {Value: warrantyEndDate}
    ],
    UI.HeaderInfo              : {
        TypeName      : 'Asset',
        TypeNamePlural: 'Assets',
        Title         : {Value: name},
        Description   : {Value: inventoryNumber},
        TypeImageUrl  : 'sap-icon://laptop'
    },
    UI.HeaderFacets            : [{
        $Type : 'UI.ReferenceFacet',
        Target: '@UI.FieldGroup#StatusHeader'
    }],
    UI.FieldGroup #StatusHeader: {Data: [
        {
            $Type                    : 'UI.DataField',
            Value                    : availabilityStatusName,
            Criticality              : availabilityStatus.criticality,
            CriticalityRepresentation: #WithIcon,
            Label                    : 'Availability'
        },
        {
            $Type                    : 'UI.DataField',
            Value                    : repairStatusName,
            Criticality              : repairStatus.criticality,
            CriticalityRepresentation: #WithIcon,
            Label                    : 'Repair Status'
        }
    ]},
    UI.Facets                  : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'General Information',
            Target: '@UI.FieldGroup#General'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Assignment History',
            Target: 'assignmentHistory/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Repair History',
            Target: 'repairRequests/@UI.LineItem'
        }
    ],
    UI.FieldGroup #General     : {Data: [
        {Value: inventoryNumber},
        {Value: name},
        {
            Value: category_code,
            Label: 'Category'
        },
        {
            Value: availabilityStatus_code,
            Label: 'Availability'
        },
        {
            Value: repairStatus_code,
            Label: 'Repair Status'
        },
        {Value: serialNumber},
        {Value: manufacturer},
        {Value: model},
        {Value: purchaseDate},
        {Value: warrantyEndDate},
        {Value: price},
        {
            Value: assignedTo_ID,
            Label: 'Assigned to'
        }
    ]}
);

annotate InventoryService.Assets with {
    category           @Common.ValueList: {
        CollectionPath: 'AssetCategories',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: category_code,
                ValueListProperty: 'code'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };
    availabilityStatus @Common.ValueList: {
        CollectionPath: 'AssetAvailabilityStatuses',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: availabilityStatus_code,
                ValueListProperty: 'code'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };
    repairStatus       @Common.ValueList: {
        CollectionPath: 'AssetRepairStatuses',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: repairStatus_code,
                ValueListProperty: 'code'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };
    assignedTo         @Common.ValueList: {
        CollectionPath: 'Employees',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: assignedTo_ID,
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'lastName'
            }
        ]
    };
};


annotate InventoryService.AssetCategories with @(
    UI.HeaderInfo         : {
        TypeName      : 'Asset Category',
        TypeNamePlural: 'Asset Categories',
        Title         : {Value: name},
        Description   : {Value: code}
    },
    UI.LineItem           : [
        {Value: code},
        {Value: name}
    ],
    UI.Facets             : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'General Information',
        Target: '@UI.FieldGroup#General'
    }],
    UI.FieldGroup #General: {Data: [
        {Value: code},
        {Value: name}
    ]}
);

annotate InventoryService.Employees with @(
    UI.HeaderInfo         : {
        TypeName      : 'Employee',
        TypeNamePlural: 'Employees',
        Title         : {Value: lastName},
        Description   : {Value: employeeNumber},
        TypeImageUrl  : 'sap-icon://employee'
    },
    UI.LineItem           : [
        {Value: employeeNumber},
        {Value: firstName},
        {Value: lastName},
        {Value: department},
        {Value: email}
    ],
    UI.Facets             : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'General Information',
            Target: '@UI.FieldGroup#General'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Assigned Assets',
            Target: 'assets/@UI.LineItem'
        }
    ],
    UI.FieldGroup #General: {Data: [
        {Value: employeeNumber},
        {Value: firstName},
        {Value: lastName},
        {Value: email},
        {Value: department}
    ]}
);

annotate InventoryService.RepairRequests with @(UI.LineItem: [
    {
        $Type : 'UI.DataFieldWithNavigationPath',
        Value : asset.name,
        Label : 'Asset',
        Target: 'asset'
    },
    {
        $Type : 'UI.DataFieldWithNavigationPath',
        Value : asset.assignedTo.lastName,
        Label : 'Asset Owner',
        Target: 'asset/assignedTo'
    },
    {Value: description},
    {
        Value: priority_code,
        Label: 'Priority'
    },
    {
        Value                    : status_code,
        Label                    : 'Status',
        Criticality              : status.criticality,
        CriticalityRepresentation: #WithIcon
    },
    {Value: createdDate}
]);

annotate InventoryService.AssetAssignments with @(
    UI.SelectionFields    : [employee_ID],
    UI.LineItem           : [
        {
            Value: asset.inventoryNumber,
            Label: 'Asset'
        },
        {
            Value: asset.name,
            Label: 'Asset Name'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : employee.lastName,
            Label : 'Employee',
            Target: 'employee'
        },
        {
            Value: employee.department,
            Label: 'Department'
        },
        {Value: assignedFrom},
        {Value: returnedOn}
    ],
    UI.HeaderInfo         : {
        TypeName      : 'Asset Assignment',
        TypeNamePlural: 'Asset Assignments',
        Title         : {Value: employee.lastName},
        Description   : {Value: asset.inventoryNumber}
    },
    UI.Facets             : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'General Information',
        Target: '@UI.FieldGroup#General'
    }],
    UI.FieldGroup #General: {Data: [
        {
            Value: asset.inventoryNumber,
            Label: 'Asset'
        },
        {
            Value: asset.name,
            Label: 'Asset Name'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : employee.lastName,
            Label : 'Employee',
            Target: 'employee'
        },
        {
            Value: employee.department,
            Label: 'Department'
        },
        {Value: assignedFrom},
        {Value: returnedOn}
    ]}
);
