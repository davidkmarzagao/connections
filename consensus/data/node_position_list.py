import json

widthX = 775 
widthY = 575

nodePositionList = []

terminate = False 
print("type terminate to stop program")
count = 0
while not terminate:
    print(f"node {count}")
    xCoord = input("x coordinate:")

    if (xCoord.lower() == "terminate") :
        terminate = True
        break

    yCoord = input("y coordinate:")

    if (yCoord.lower() == "terminate") :
        terminate = True
        break

    nodePositionList.append([int(xCoord)/widthX, int(yCoord)/widthY])
    count += 1 
print("Starting to write list data into a txt file")


if len(nodePositionList) != 0: 
    with open('data/node_position.txt', 'w+') as fp:
        json.dump(nodePositionList, fp)
        print("completed task")