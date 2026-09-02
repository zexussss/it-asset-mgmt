using {itam as db} from '../db/schema';


@requires: [
    'Employee',
    'Admin'
]
service EmployeeService @(path: '/employee') {

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
