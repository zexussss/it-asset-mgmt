using {itam as db} from '../db/schema';

@requires: [
    'AssetManager',
    'Admin'
]
service InventoryService @(path: '/service/inventory') {


    @readonly
    entity Me {
        key id         : String;
            firstName  : String;
            lastName   : String;
            email      : String;
            department : String;
    }

    @odata.draft.enabled
    entity Assets                    as
        projection on db.Asset {
            *,
            category.name                          as categoryName           : String,
            availabilityStatus.name                 as availabilityStatusName : String,
            repairStatus.name                       as repairStatusName       : String,
            assignedTo.firstName                    as assignedToFirstName    : String,
            assignedTo.lastName                     as assignedToLastName     : String,
            case
                when availabilityStatus.code = 'IN_STOCK' then true
                else false
            end                                  as isAssignable           : Boolean,
            case
                when assignedTo is not null then true
                else false
            end                                  as isAssigned             : Boolean
        }
        actions {
            @Core.OperationAvailable: isAssignable
            action assign(employeeID: UUID) returns Assets;

            @Core.OperationAvailable: isAssigned
            action deassign() returns Assets;
        };



    annotate Assets with @cds.search: {
        name,
        inventoryNumber,
        serialNumber,
        manufacturer,
        model,
        category.name,
        assignedTo.firstName,
        assignedTo.lastName
    };

    entity AssetCategories           as projection on db.AssetCategory;

    @readonly
    entity AssetAvailabilityStatuses as projection on db.AssetAvailabilityStatus;

    @readonly
    entity AssetRepairStatuses       as projection on db.AssetRepairStatus;

    @odata.draft.enabled
    entity Employees                 as projection on db.Employee;

    @readonly
    entity AssetAssignments          as projection on db.AssetAssignment;


    annotate AssetAssignments with @cds.search: {
        asset.inventoryNumber,
        asset.name,
        employee.firstName,
        employee.lastName,
        employee.employeeNumber
    };

    @readonly
    entity RepairRequests            as projection on db.RepairRequest;
}
