namespace itam;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity AssetCategory {
  key code : String(10);
      name : String(50) @mandatory;
}

entity AssetAvailabilityStatus {
  key code        : String(15);
      name        : String(50)  @mandatory;
      criticality : Integer     @assert.range: [0, 3] default 0;
}

entity AssetRepairStatus {
  key code        : String(15);
      name        : String(50)  @mandatory;
      criticality : Integer     @assert.range: [0, 3] default 0;
}

entity Priority {
  key code        : String(10);
      name        : String(20)  @mandatory;
      criticality : Integer     @assert.range: [0, 3] default 0;
}

entity RepairRequestStatus {
  key code        : String(15);
      name        : String(50)  @mandatory;
      criticality : Integer     @assert.range: [0, 3] default 0;
}

@assert.unique.email: [email]
entity Employee : cuid {
  employeeNumber : String(20)  @mandatory;
  firstName      : String(50)  @mandatory;
  lastName       : String(50)  @mandatory;
  email          : String(100) @mandatory @assert.format: '^[^\s@]+@[^\s@]+\.[^\s@]+$';
  department     : String(50);
  assets         : Association to many Asset
                     on assets.assignedTo = $self;
}

@assert.unique.inventoryNumber: [inventoryNumber]
entity Asset : cuid, managed {
  inventoryNumber           : String(20)  @mandatory;
  name                      : String(100) @mandatory;
  category                  : Association to AssetCategory @mandatory;

  availabilityStatus        : Association to AssetAvailabilityStatus default 'IN_STOCK';
  repairStatus              : Association to AssetRepairStatus default 'OK';

  serialNumber              : String(50);
  manufacturer              : String(50);
  model                     : String(100);
  purchaseDate              : Date;
  warrantyEndDate           : Date;
  price                     : Decimal(10, 2) @assert.range: [0, 100000000];

  assignedTo                : Association to Employee;

  repairRequests            : Composition of many RepairRequest
                                on repairRequests.asset = $self;
  assignmentHistory         : Composition of many AssetAssignment
                                on assignmentHistory.asset = $self;
  notes                     : Composition of many AssetNote
                                on notes.asset = $self;

  virtual averageRepairDays : Decimal(5, 1);
}

entity AssetAssignment : cuid {
  asset        : Association to Asset    @mandatory;
  employee     : Association to Employee @mandatory;
  assignedFrom : Date                    @mandatory;
  returnedOn   : Date;
}

entity AssetNote : cuid, managed {
  asset    : Association to Asset @mandatory;
  content  : String(1000)         @mandatory;
  authorID : String(50)           @mandatory;
}

entity RepairRequest : cuid, managed {
  asset          : Association to Asset    @mandatory;
  requestedBy    : Association to Employee @mandatory;
  description    : String(1000) @mandatory;
  priority       : Association to Priority default 'MEDIUM';
  status         : Association to RepairRequestStatus default 'OPEN';
  technician     : String(100);
  createdDate    : Date;
  resolvedDate   : Date;
  resolutionDays : Integer @assert.range: [0, 3650];
  repairLogs     : Composition of many RepairLog
                     on repairLogs.repairRequest = $self;
}

entity RepairLog : cuid {
  repairRequest : Association to RepairRequest @mandatory;
  logDate       : DateTime                     @mandatory;
  actionType    : String(30)                   @mandatory @assert.enum: [
    'Diagnosis',
    'InProgress',
    'Fixed',
    'Rejected',
    'Note'
  ];
  technician    : String(100);
  note          : String(1000) @mandatory;
}
