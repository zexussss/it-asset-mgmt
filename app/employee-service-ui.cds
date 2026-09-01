using {EmployeeService} from '../srv/employee-service';

annotate EmployeeService.MyRepairRequests with @(
    UI.SelectionFields         : [status_code],
    UI.LineItem                : [
        {
            Value: assetInventoryNumber,
            Label: 'Asset'
        },
        {
            Value: assetName,
            Label: 'Asset Name'
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
    ],
    UI.HeaderInfo              : {
        TypeName      : 'Repair Request',
        TypeNamePlural: 'My Repair Requests',
        Title         : {Value: description},
        Description   : {Value: assetInventoryNumber},
        TypeImageUrl  : 'sap-icon://wrench'
    },
    UI.HeaderFacets            : [{
        $Type : 'UI.ReferenceFacet',
        Target: '@UI.FieldGroup#StatusHeader'
    }],
    UI.FieldGroup #StatusHeader: {Data: [{
        $Type                    : 'UI.DataField',
        Value                    : status_code,
        Criticality              : status.criticality,
        CriticalityRepresentation: #WithIcon,
        Label                    : 'Status'
    }]},
    UI.Facets                  : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Request Details',
        Target: '@UI.FieldGroup#General'
    }],
    UI.FieldGroup #General     : {Data: [
        {
            Value: assetInventoryNumber,
            Label: 'Asset'
        },
        {
            Value: assetName,
            Label: 'Asset Name'
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
            Value: createdDate,
            Label: 'Created Date'
        },
        {
            Value: resolvedDate,
            Label: 'Resolved Date'
        }
    ]}
);

annotate EmployeeService.MyRepairRequests with {
    status @readonly;
};

annotate EmployeeService.MyAssets with @(
    UI.SelectionFields    : [
        category_code,
        availabilityStatus_code,
        repairStatus_code
    ],
    UI.LineItem           : [
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
        {Value: warrantyEndDate}
    ],
    UI.HeaderInfo         : {
        TypeName      : 'My Asset',
        TypeNamePlural: 'My Assets',
        Title         : {Value: name},
        Description   : {Value: inventoryNumber},
        TypeImageUrl  : 'sap-icon://laptop'
    },
    UI.Facets             : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'General Information',
        Target: '@UI.FieldGroup#General'
    }],
    UI.FieldGroup #General: {Data: [
        {
            Value: inventoryNumber,
            Label: 'Inventory Number'
        },
        {
            Value: name,
            Label: 'Name'
        },
        {
            Value: categoryName,
            Label: 'Category'
        },
        {
            Value                    : availabilityStatusName,
            Criticality              : availabilityStatus.criticality,
            CriticalityRepresentation: #WithIcon,
            Label                    : 'Availability'
        },
        {
            Value                    : repairStatusName,
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
        }
    ]}
);
