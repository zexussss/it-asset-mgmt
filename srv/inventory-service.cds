using {itam as db} from '../db/schema';


@requires: [
    'AssetManager',
    'Admin'
]
service InventoryService @(path: '/inventory') {

    @odata.draft.enabled
    entity Assets                    as
        projection on db.Asset {
            *,
            category.name           as categoryName           : String,
            availabilityStatus.name as availabilityStatusName : String,
            repairStatus.name       as repairStatusName       : String,
            assignedTo.firstName    as assignedToFirstName    : String,
            assignedTo.lastName     as assignedToLastName     : String
        };

    entity AssetCategories           as projection on db.AssetCategory;

    @readonly
    entity AssetAvailabilityStatuses as projection on db.AssetAvailabilityStatus;

    @readonly
    entity AssetRepairStatuses       as projection on db.AssetRepairStatus;

    @readonly
    entity Employees                 as projection on db.Employee;

    @readonly
    entity AssetAssignments          as projection on db.AssetAssignment;

    @readonly
    entity RepairRequests            as projection on db.RepairRequest;
}
