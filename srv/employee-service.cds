using {itam as db} from '../db/schema';

@requires: [
    'Employee',
    'Admin'
]
service EmployeeService @(path: '/service/employee') {


    @readonly
    entity Me {
        key id         : String;
            firstName  : String;
            lastName   : String;
            email      : String;
            department : String;
    }

    @readonly
    entity MyAssets              as
        projection on db.Asset {
            *,
            category.name           as categoryName           : String,
            availabilityStatus.name as availabilityStatusName : String,
            repairStatus.name       as repairStatusName       : String
        }
        actions {
            action createRepairRequest(description: String, priority: String) returns MyRepairRequests;
        };

    entity MyRepairRequests      as
        projection on db.RepairRequest {
            *,
            asset.inventoryNumber as assetInventoryNumber : String,
            asset.name            as assetName            : String
        };

    annotate MyAssets with @cds.search: {
        name,
        inventoryNumber,
        serialNumber,
        manufacturer,
        model,
        category.name
    };

    annotate MyRepairRequests with @cds.search: {
        description,
        assetInventoryNumber,
        assetName
    };


    @readonly
    entity Employees             as
        projection on db.Employee {
            key ID,
                firstName,
                lastName
        };

    @readonly
    entity AssetCategories       as projection on db.AssetCategory;

    @readonly
    entity Priorities            as projection on db.Priority;

    @readonly
    entity RepairRequestStatuses as projection on db.RepairRequestStatus;

    @readonly
    entity AssetAvailabilityStatus as projection on db.AssetAvailabilityStatus;

    @readonly
    entity AssetRepairStatus as projection on db.AssetRepairStatus;
}
