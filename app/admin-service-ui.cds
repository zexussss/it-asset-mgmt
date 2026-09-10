using {AdminService} from '../srv/admin-service';


annotate AdminService.Assets with @(
    UI.SelectionFields         : [
        category_code,
        availabilityStatus_code,
        repairStatus_code
    ],
    UI.LineItem                : [
        {Value: inventoryNumber},
        {Value: name},
        {
            Value: category_code,
            Label: 'Category'
        },
        {
            Value                    : availabilityStatus_code,
            Label                    : 'Availability',
            Criticality              : availabilityStatus.criticality,
            CriticalityRepresentation: #WithIcon
        },
        {
            Value                    : repairStatus_code,
            Label                    : 'Repair Status',
            Criticality              : repairStatus.criticality,
            CriticalityRepresentation: #WithIcon
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : assignedTo.lastName,
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
            Value                    : availabilityStatus_code,
            Criticality              : availabilityStatus.criticality,
            CriticalityRepresentation: #WithIcon,
            Label                    : 'Availability'
        },
        {
            $Type                    : 'UI.DataField',
            Value                    : repairStatus_code,
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
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Notes',
            Target: 'notes/@UI.LineItem'
        }
    ],
    UI.FieldGroup #General     : {Data: [
        {
            Value: inventoryNumber,
            Label: 'Inventory Number'
        },
        {
            Value: name,
            Label: 'Name'
        },
        {
            Value: category_code,
            Label: 'Category'
        },
        {
            Value                    : availabilityStatus_code,
            Criticality              : availabilityStatus.criticality,
            CriticalityRepresentation: #WithIcon,
            Label                    : 'Availability'
        },
        {
            Value                    : repairStatus_code,
            Criticality              : repairStatus.criticality,
            CriticalityRepresentation: #WithIcon,
            Label                    : 'Repair Status'
        },
        {
            Value: serialNumber,
            Label: 'Serial Number'
        },
        {
            Value: manufacturer,
            Label: 'Manufacturer'
        },
        {
            Value: model,
            Label: 'Model'
        },
        {
            Value: purchaseDate,
            Label: 'Purchase Date'
        },
        {
            Value: warrantyEndDate,
            Label: 'Warranty End Date'
        },
        {
            Value: price,
            Label: 'Price'
        },
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : assignedTo.lastName,
            Label : 'Assigned to',
            Target: 'assignedTo'
        }
    ]}
);

annotate AdminService.Assets with {
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

annotate AdminService.Employees with @(
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
        {
            Value: employeeNumber,
            Label: 'Employee Number'
        },
        {
            Value: firstName,
            Label: 'First Name'
        },
        {
            Value: lastName,
            Label: 'Last Name'
        },
        {
            Value: email,
            Label: 'Email'
        },
        {
            Value: department,
            Label: 'Department'
        }
    ]}
);

annotate AdminService.RepairRequests with @(
    UI.SelectionFields           : [
        status_code,
        priority_code
    ],
    UI.LineItem                  : [
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
            Value                    : priority_code,
            Label                    : 'Priority',
            Criticality              : priority.criticality,
            CriticalityRepresentation: #WithoutIcon
        },
        {
            Value                    : status_code,
            Label                    : 'Status',
            Criticality              : status.criticality,
            CriticalityRepresentation: #WithIcon
        },
        {Value: technician},
        {Value: createdDate}
    ],
    UI.HeaderInfo                : {
        TypeName      : 'Repair Request',
        TypeNamePlural: 'Repair Requests',
        Title         : {Value: description},
        Description   : {Value: asset.inventoryNumber},
        TypeImageUrl  : 'sap-icon://wrench'
    },
    UI.HeaderFacets              : [{
        $Type : 'UI.ReferenceFacet',
        Target: '@UI.FieldGroup#StatusHeader'
    }],
    UI.FieldGroup #StatusHeader  : {Data: [{
        $Type                    : 'UI.DataField',
        Value                    : status_code,
        Criticality              : status.criticality,
        CriticalityRepresentation: #WithIcon,
        Label                    : 'Status'
    }]},
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'General Information',
            Target: '@UI.FieldGroup#RequestGeneral'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Repair Log',
            Target: 'repairLogs/@UI.LineItem'
        }
    ],
    UI.FieldGroup #RequestGeneral: {Data: [
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
        {
            Value: requestedBy_ID,
            Label: 'Requested By'
        },
        {
            Value: description,
            Label: 'Description'
        },
        {
            Value: priority_code,
            Label: 'Priority'
        },
        {
            Value                    : status_code,
            Criticality              : status.criticality,
            CriticalityRepresentation: #WithIcon,
            Label                    : 'Status'
        },
        {
            Value: technician,
            Label: 'Technician'
        },
        {
            Value: createdDate,
            Label: 'Created Date'
        },
        {
            Value: resolvedDate,
            Label: 'Resolved Date'
        }
    ]}
);

annotate AdminService.RepairRequests with {
    status         @readonly;
    resolutionDays @readonly;
    status   @Common.ValueList: {
        CollectionPath: 'RepairRequestStatuses',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: status_code,
                ValueListProperty: 'code'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };
    priority @Common.ValueList: {
        CollectionPath: 'Priorities',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: priority_code,
                ValueListProperty: 'code'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };
};

annotate AdminService.RepairLogs with @(
    UI.HeaderInfo         : {
        TypeName      : 'Repair Log Entry',
        TypeNamePlural: 'Repair Logs',
        Title         : {Value: actionType},
        Description   : {Value: logDate},
        TypeImageUrl  : 'sap-icon://history'
    },
    UI.Facets             : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'General Information',
        Target: '@UI.FieldGroup#General'
    }],
    UI.FieldGroup #General: {Data: [
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : repairRequest.asset.name,
            Label : 'Asset',
            Target: 'repairRequest/asset'
        },
        {
            Value: logDate,
            Label: 'Log Date'
        },
        {
            Value: actionType,
            Label: 'Action Type'
        },
        {
            Value: technician,
            Label: 'Technician'
        },
        {
            Value: note,
            Label: 'Note'
        }
    ]},
    UI.LineItem           : [
        {
            $Type : 'UI.DataFieldWithNavigationPath',
            Value : repairRequest.asset.name,
            Label : 'Asset',
            Target: 'repairRequest/asset'
        },
        {Value: logDate},
        {Value: actionType},
        {Value: technician},
        {Value: note}
    ]
);

annotate AdminService.AssetAssignments with @(UI.LineItem: [
    {
        Value: employee_ID,
        Label: 'Employee'
    },
    {Value: assignedFrom},
    {Value: returnedOn}
]);

annotate AdminService.AssetNotes with @(UI.LineItem: [
    {Value: content},
    {Value: authorID},
    {Value: createdAt}
]);

annotate AdminService.TechnicianStatistics with @(
    UI.SelectionFields    : [
        technician,
        createdDate
    ],
    UI.HeaderInfo         : {
        TypeName      : 'Repair Request',
        TypeNamePlural: 'Repair Requests by Technician',
        Title         : {Value: description},
        Description   : {Value: technician},
        TypeImageUrl  : 'sap-icon://wrench'
    },
    UI.LineItem           : [
        {
            Value: technician,
            Label: 'Technician'
        },
        {
            Value: createdDate,
            Label: 'Created On'
        },
        {Value: description},
        {
            Value: resolutionDays,
            Label: 'Resolution Time (days)'
        },
        {
            Value: requestCount,
            Label: 'Requests'
        }
    ],
    UI.Facets             : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'General Information',
        Target: '@UI.FieldGroup#General'
    }],
    UI.FieldGroup #General: {Data: [
        {
            Value: technician,
            Label: 'Technician'
        },
        {
            Value: createdDate,
            Label: 'Created On'
        },
        {
            Value: description,
            Label: 'Description'
        },
        {
            Value: resolutionDays,
            Label: 'Resolution Time (days)'
        }
    ]}
);
